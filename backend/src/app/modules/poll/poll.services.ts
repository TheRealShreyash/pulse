import { and, asc, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "../../../db";
import {
  optionsTable,
  pollsTable,
  usersTable,
  votesTable,
} from "../../../db/schema";
import type { Request } from "express";
import { ApiError } from "../../common/utils";
import type { CreatePollPayload, ResponsePayload } from "./poll.models";
import { getRequestFingerprint } from "./utils/fingerprint";
import { pollEmitter } from "../../../socket/emitter";

// Polls have no background job flipping status to ENDED once expiresAt
// passes — enforced lazily instead, at the points that actually matter
// (voting, and viewing a poll's detail/list). The WHERE ... status="LIVE"
// guard makes the UPDATE a no-op for whichever concurrent caller loses the
// race, so pollClosed only ever emits once per poll.
async function expireIfPastDue(poll: typeof pollsTable.$inferSelect) {
  if (
    poll.status === "LIVE" &&
    poll.expiresAt &&
    poll.expiresAt.getTime() < Date.now()
  ) {
    const [updated] = await db
      .update(pollsTable)
      .set({ status: "ENDED" })
      .where(and(eq(pollsTable.id, poll.id), eq(pollsTable.status, "LIVE")))
      .returning();

    if (updated) {
      pollEmitter.pollClosed(poll.id);
      return updated;
    }
  }

  return poll;
}

export const createPoll = async (
  payload: CreatePollPayload,
  creatorId: string,
) => {
  const {
    title,
    description,
    isAnonymous,
    expiresAt,
    options,
    status,
    showLiveResults,
  } = payload;

  const [creator] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, creatorId))
    .limit(1);

  if (!creator) throw ApiError.badRequest("User does not exist!");

  const [poll] = await db
    .insert(pollsTable)
    .values({
      creatorId,
      title,
      description,
      status,
      isAnonymous,
      showLiveResults,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  if (!poll) throw ApiError.internalError("Internal server error");

  await db.insert(optionsTable).values(
    options.map((text, i) => ({
      pollId: poll.id,
      text,
      displayOrder: i + 1,
    })),
  );

  return poll;
};

export const getPoll = async (pollId: string, userId?: string) => {
  if (!pollId) throw ApiError.badRequest("No poll id provided");

  const [pollResult] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, pollId))
    .limit(1);

  if (!pollResult) throw ApiError.badRequest("Invalid poll id");

  const poll = await expireIfPastDue(pollResult);

  if (poll.status === "DRAFT" && poll.creatorId !== userId) {
    throw ApiError.forbidden("You do not have permission to view this draft");
  }

  const [options, voteResult, velocity] = await Promise.all([
    db
      .select({
        id: optionsTable.id,
        text: optionsTable.text,
        displayOrder: optionsTable.displayOrder,
        count: sql<number>`cast(count(${votesTable.id}) as int)`,
      })
      .from(optionsTable)
      .leftJoin(votesTable, eq(votesTable.optionId, optionsTable.id))
      .where(eq(optionsTable.pollId, poll.id))
      .groupBy(optionsTable.id)
      .orderBy(asc(optionsTable.displayOrder)),

    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(votesTable)
      .where(eq(votesTable.pollId, poll.id)),

    db
      .select({
        hour: sql<string>`date_trunc('hour', ${votesTable.createdAt})::text`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(votesTable)
      .where(eq(votesTable.pollId, poll.id))
      .groupBy(sql`date_trunc('hour', ${votesTable.createdAt})`)
      .orderBy(sql`date_trunc('hour', ${votesTable.createdAt})`),
  ]);

  const totalResponses = voteResult[0]?.count ?? 0;

  return { ...poll, options, totalResponses, velocity };
};

export const getUserPolls = async (creatorId: string) => {
  // One bulk lazy-expire pass so the dashboard list doesn't show a poll as
  // LIVE past its expiry just because nobody has viewed/voted on it yet to
  // trigger expireIfPastDue elsewhere.
  await db
    .update(pollsTable)
    .set({ status: "ENDED" })
    .where(
      and(
        eq(pollsTable.creatorId, creatorId),
        eq(pollsTable.status, "LIVE"),
        lt(pollsTable.expiresAt, new Date()),
      ),
    );

  const polls = await db
    .select({
      id: pollsTable.id,
      title: pollsTable.title,
      description: pollsTable.description,
      status: pollsTable.status,
      isAnonymous: pollsTable.isAnonymous,
      showLiveResults: pollsTable.showLiveResults,
      expiresAt: pollsTable.expiresAt,
      createdAt: pollsTable.createdAt,
      totalResponses: sql<number>`cast(count(${votesTable.id}) as int)`,
    })
    .from(pollsTable)
    .leftJoin(votesTable, eq(pollsTable.id, votesTable.pollId))
    .where(eq(pollsTable.creatorId, creatorId))
    .groupBy(pollsTable.id)
    .orderBy(desc(pollsTable.createdAt));

  if (!polls) throw ApiError.badRequest("No polls found for that user");

  return polls;
};

export const updatePoll = async (pollId: string, creatorId: string) => {
  const [poll] = await db
    .update(pollsTable)
    .set({ status: "PUBLISHED" })
    .where(and(eq(pollsTable.id, pollId), eq(pollsTable.creatorId, creatorId)))
    .returning();

  if (!poll) throw ApiError.notFound("No poll found with that id");

  return poll;
};

export const closePoll = async (pollId: string, creatorId: string) => {
  const [poll] = await db
    .update(pollsTable)
    .set({ status: "ENDED" })
    .where(and(eq(pollsTable.id, pollId), eq(pollsTable.creatorId, creatorId)))
    .returning();

  if (!poll) throw ApiError.notFound("No poll found with that id");

  pollEmitter.pollClosed(pollId);

  return poll;
};

export const respond = async (
  req: Request,
  payload: ResponsePayload,
  userId: string | null,
) => {
  const { pollId, optionId } = payload;
  const fingerprint = getRequestFingerprint(req);

  const [pollResult] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, pollId))
    .limit(1);

  if (!pollResult) throw ApiError.badRequest("No poll found");

  const poll = await expireIfPastDue(pollResult);

  if (poll.status !== "LIVE")
    throw ApiError.forbidden("This poll is not accepting votes");

  if (!poll.isAnonymous && !userId) {
    throw ApiError.unauthorized("Sign in required to vote");
  }

  // optionsTable.id is only unique globally, not scoped to a poll — without
  // this, a client could submit an optionId belonging to a different poll
  // entirely and it would insert silently (the FK only checks the option
  // exists somewhere), corrupting that other poll's vote counts.
  const [option] = await db
    .select({ id: optionsTable.id })
    .from(optionsTable)
    .where(and(eq(optionsTable.id, optionId), eq(optionsTable.pollId, pollId)))
    .limit(1);

  if (!option) throw ApiError.badRequest("Invalid option for this poll");

  const existingVote = await db
    .select()
    .from(votesTable)
    .where(
      and(
        eq(votesTable.pollId, pollId),
        userId
          ? eq(votesTable.userId, userId)
          : eq(votesTable.fingerprint, fingerprint ?? ""),
      ),
    )
    .limit(1);

  if (existingVote.length > 0) {
    throw ApiError.badRequest("You have already voted on this poll");
  }

  try {
    await db.insert(votesTable).values({
      pollId: poll.id,
      optionId,
      userId: userId || null,
      fingerprint: userId ? null : fingerprint || null,
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      throw ApiError.badRequest("You have already voted on this poll");
    }
    throw err;
  }

  const updatedOptions = await db
    .select({
      count: sql<number>`cast(count(${votesTable.id}) as int)`,
    })
    .from(optionsTable)
    .leftJoin(votesTable, eq(votesTable.optionId, optionsTable.id))
    .where(eq(optionsTable.pollId, poll.id))
    .groupBy(optionsTable.id)
    .orderBy(asc(optionsTable.displayOrder));

  const counts = updatedOptions.map((o) => o.count);
  const total = counts.reduce((a, b) => a + b, 0);

  pollEmitter.voteUpdate(poll.id, counts, total);

  return true;
};

export const hasVoted = async (
  req: Request,
  pollId: string,
  userId: string | null,
) => {
  const fingerprint = getRequestFingerprint(req);

  const [vote] = await db
    .select()
    .from(votesTable)
    .where(
      and(
        eq(votesTable.pollId, pollId),
        userId
          ? eq(votesTable.userId, userId)
          : eq(votesTable.fingerprint, fingerprint ?? ""),
      ),
    )
    .limit(1);

  return !!vote;
};

import { and, asc, desc, eq, sql } from "drizzle-orm";
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

  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, pollId))
    .limit(1);

  if (!poll) throw ApiError.badRequest("Invalid poll id");

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

  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, pollId))
    .limit(1);

  if (!poll) throw ApiError.badRequest("No poll found");
  if (poll.status !== "LIVE")
    throw ApiError.forbidden("This poll is not accepting votes");

  if (!poll.isAnonymous && !userId) {
    throw ApiError.unauthorized("Sign in required to vote");
  }

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

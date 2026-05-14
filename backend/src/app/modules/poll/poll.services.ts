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

  const options = await db
    .select()
    .from(optionsTable)
    .where(eq(optionsTable.pollId, poll.id))
    .orderBy(asc(optionsTable.displayOrder));

  const voteResult = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(votesTable)
    .where(eq(votesTable.pollId, poll.id));

  const totalResponses = voteResult[0]?.count ?? 0;

  const velocity = await db
    .select({
      hour: sql<string>`date_trunc('hour', ${votesTable.createdAt})::text`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(votesTable)
    .where(eq(votesTable.pollId, poll.id))
    .groupBy(sql`date_trunc('hour', ${votesTable.createdAt})`)
    .orderBy(sql`date_trunc('hour', ${votesTable.createdAt})`);

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

  await db.insert(votesTable).values({
    pollId: poll.id,
    optionId,
    userId: userId || null, // Can be null for anonymous polls
    fingerprint: fingerprint || null,
  });
  return true;
};

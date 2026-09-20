import { eq } from "drizzle-orm";
import { db } from "../../../../db";
import { pollsTable } from "../../../../db/schema";
import { isValidUUID } from "./validate-uuid";

/**
 * Every poll is reachable by its raw id (old links, anywhere it leaked) or
 * its slug (new share links). This is the single place that decides which
 * column to check — every service function that takes a poll identifier
 * from client input should go through this rather than re-deriving the
 * same isValidUUID(...) ? id : slug branch itself, which is exactly how
 * hasVoted() and respond() ended up silently requiring a strict uuid after
 * slugs were introduced.
 */
export async function resolvePoll(pollIdOrSlug: string) {
  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(
      isValidUUID(pollIdOrSlug)
        ? eq(pollsTable.id, pollIdOrSlug)
        : eq(pollsTable.slug, pollIdOrSlug),
    )
    .limit(1);

  return poll;
}

import { z } from "zod";

export const createPollPayloadModel = z.object({
  title: z.string().min(1).max(280),
  description: z.string().max(300).optional(),
  options: z.array(z.string().min(1).max(120)).min(2).max(10),
  isAnonymous: z.boolean().default(false),
  showLiveResults: z.boolean().default(true),
  status: z.enum(["DRAFT", "LIVE"]).default("DRAFT").optional(),
  expiresAt: z.iso.datetime().optional().nullable().default(null),
});

export const responsePayloadModel = z.object({
  // Can be a poll's raw id or its slug (resolvePoll handles telling them
  // apart) — optionId stays a strict uuid, options are never exposed by slug.
  pollId: z.string().min(1).max(40),
  optionId: z.uuid(),
});

export type CreatePollPayload = z.infer<typeof createPollPayloadModel>;
export type ResponsePayload = z.infer<typeof responsePayloadModel>;

import { rateLimit } from "express-rate-limit";
import { ApiResponse } from "../utils";
import ApiError from "../utils/api-error";

// Shared handler so a rate-limit rejection returns the same JSON shape
// (ApiResponse.error) as every other error in this app, instead of
// express-rate-limit's own default plain-text response.
function tooManyRequests(message: string) {
  return (_req: unknown, res: Parameters<typeof ApiResponse.error>[0]) => {
    ApiResponse.error(res, new ApiError(429, message));
  };
}

// Generous safety net for the whole app — not meant to shape normal usage,
// just to blunt gross abuse (scraping, misbehaving clients, etc).
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many requests. Please try again later."),
});

// Anonymous voting has no account behind it to hold accountable, and the
// poll embed makes this endpoint reachable from arbitrary third-party pages
// — this is the one most worth guarding tightly.
export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many votes from this network. Please try again later."),
});

// Poll creation requires a signed-in account already, so this is mainly
// about capping spam poll creation from a single compromised or malicious
// account/IP, not a primary defense.
export const createPollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many polls created recently. Please try again later."),
});

import crypto from "node:crypto";
import type { Request } from "express";

/**
 * Generates a unique hash based on the user's browser environment.
 */
export const getRequestFingerprint = (req: Request): string => {
  // Brave users often have specific User-Agent patterns or Client-Hints
  const userAgent = req.headers["user-agent"] || "unknown";
  const acceptLanguage = req.headers["accept-language"] || "unknown";

  // IP is the strongest identifier for non-logged in users
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";

  // Combine headers into a single string for hashing
  const rawData = `${userAgent}|${acceptLanguage}|${ip}`;

  return crypto.createHash("sha256").update(rawData).digest("hex");
};

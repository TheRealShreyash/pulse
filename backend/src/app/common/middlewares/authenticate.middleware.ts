import type { Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import ApiError from "../utils/api-error";
import ApiResponse from "../utils/api-response";
import { verifyAccessToken } from "../../modules/auth/utils/token";
import { auth } from "../../../lib/auth";
import type { AuthenticatedRequest } from "../utils/interfaces";

// Checks for a Better Auth (Google) session first, since it has its own
// cookie separate from Iris's. Returns null rather than throwing so both
// authenticate() and pollAuthenticate() can fall through to the Iris check
// unchanged when there's no Better Auth session.
async function getBetterAuthUser(req: AuthenticatedRequest) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) return null;

  const pulseUserId = (session.user as { pulseUserId?: string | null })
    .pulseUserId;
  if (!pulseUserId) return null;

  return {
    sub: pulseUserId,
    email: session.user.email,
    name: session.user.name,
    provider: "google" as const,
  };
}

export const authenticate = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const betterAuthUser = await getBetterAuthUser(req);
      if (betterAuthUser) {
        req.user = betterAuthUser;
        return next();
      }

      const token = req.cookies["accessToken"];
      if (!token) throw ApiError.badRequest("No access token");

      const user = await verifyAccessToken(token);
      req.user = { ...user, provider: "iris" as const };

      next();
    } catch (error) {
      ApiResponse.error(
        res,
        ApiError.unauthorized("Session expired or invalid token"),
      );
    }
  };
};

export const pollAuthenticate = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const betterAuthUser = await getBetterAuthUser(req).catch(() => null);
    if (betterAuthUser) {
      req.user = betterAuthUser;
      return next();
    }

    const token = req.cookies["accessToken"];

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const user = await verifyAccessToken(token);
      req.user = { ...user, provider: "iris" as const };
      next();
    } catch {
      return next(ApiError.unauthorized("Session expired or invalid token"));
    }
  };
};

export const restrictToAuthenticatedUser = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (!req.user)
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    next();
  };
};

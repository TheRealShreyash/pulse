import type { Request, Response } from "express";
import {
  CLIENT_ID,
  FRONTEND_URL,
  IRIS_AUTH_URL,
  NODE_ENV,
} from "../../../config";
import { ApiError, ApiResponse } from "../../common/utils";
import { callback, refreshTokens, registerUser } from "./auth.services";
import { verifyAccessToken } from "./utils/token";
import type { AuthenticatedRequest } from "../../common/utils/interfaces";

const isProduction = NODE_ENV.toLowerCase() === "production";

// SameSite=None cookies are rejected outright by browsers unless Secure is
// also set, and Secure cookies never get attached over plain HTTP — so in
// dev (http://localhost) "none" silently drops both auth cookies.
function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge,
  };
}

export class AuthController {
  static async handleMe(req: AuthenticatedRequest, res: Response) {
    try {
      ApiResponse.ok(res, "Me", req.user);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleIrisLogin(_: Request, res: Response) {
    try {
      res.redirect(`${IRIS_AUTH_URL}/auth/authenticate?clientId=${CLIENT_ID}`);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleIrisSignup(_: Request, res: Response) {
    try {
      res.redirect(
        `${IRIS_AUTH_URL}/auth/authenticate/signup?clientId=${CLIENT_ID}`,
      );
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const data = await callback(code);
      const { accessToken, refreshToken } = data.data as {
        accessToken: string;
        refreshToken: string;
      };

      // Registration is checked before any cookie is set, so a rejected
      // sign-in (e.g. email already registered elsewhere) never leaves the
      // browser holding valid-looking cookies for an account that doesn't
      // actually exist in usersTable.
      const userData = await verifyAccessToken(accessToken);
      await registerUser(userData);

      res.cookie(
        "refreshToken",
        refreshToken,
        authCookieOptions(24 * 60 * 60 * 1000),
      );
      res.cookie("accessToken", accessToken, authCookieOptions(15 * 60 * 1000));

      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        res.redirect(
          `${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`,
        );
        return;
      }
      // Instead of this response serve an error file
      ApiResponse.error(res, error);
    }
  }

  static async handleRefreshToken(req: Request, res: Response) {
    try {
      const oldRefreshToken = req.cookies["refreshToken"];
      const { accessToken, refreshToken } =
        await refreshTokens(oldRefreshToken);

      res.cookie(
        "refreshToken",
        refreshToken,
        authCookieOptions(24 * 60 * 60 * 1000),
      );
      res.cookie("accessToken", accessToken, authCookieOptions(15 * 60 * 1000));

      ApiResponse.ok(res, "Tokens refreshed successfully");
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleUserInfo(req: AuthenticatedRequest, res: Response) {
    try {
      ApiResponse.ok(res, "Userinfo through token", req.user!);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleLogout(_: Request, res: Response) {
    try {
      // clearCookie only actually removes the cookie if these attributes
      // match how it was set (path/httpOnly/secure/sameSite) — a mismatch
      // here is a common way for "logout" to silently do nothing.
      const { maxAge: _maxAge, ...clearOptions } = authCookieOptions(0);
      res.clearCookie("accessToken", clearOptions);
      res.clearCookie("refreshToken", clearOptions);
      ApiResponse.ok(res, "Logged out");
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

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

      res.cookie(
        "refreshToken",
        refreshToken,
        authCookieOptions(24 * 60 * 60 * 1000),
      );
      res.cookie("accessToken", accessToken, authCookieOptions(15 * 60 * 1000));

      const userData = await verifyAccessToken(accessToken);

      await registerUser(userData);

      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
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
}

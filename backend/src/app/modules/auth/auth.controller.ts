import type { Request, Response } from "express";
import { CLIENT_ID, FRONTEND_URL, IRIS_AUTH_URL, NODE_ENV } from "../../config";
import { ApiResponse } from "../../common/utils";
import { callback, refreshTokens } from "./auth.services";

export class AuthController {
  static async handleIrisLogin(_: Request, res: Response) {
    try {
      res.redirect(`${IRIS_AUTH_URL}/auth/authenticate?clientId=${CLIENT_ID}`);
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
      const isProduction = NODE_ENV.toLowerCase() === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.redirect(FRONTEND_URL);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleRefreshToken(req: Request, res: Response) {
    try {
      const oldRefreshToken = req.cookies["refreshToken"];
      const { accessToken, refreshToken } =
        await refreshTokens(oldRefreshToken);

      const isProduction = NODE_ENV.toLowerCase() === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      ApiResponse.ok(res, "Tokens refreshed successfully");
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

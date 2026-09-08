import express from "express";
import type { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import { FRONTEND_URL } from "../config";
import pollRouter from "./modules/poll/poll.routes";
import { ApiResponse } from "./common/utils";

export function createApplication() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.use("/api/poll", pollRouter);

  app.get("/health", (_, res) => {
    return res.json({ success: true, status: "Healthy" });
  });

  // Catches errors forwarded via next(err) (e.g. pollAuthenticate) so they
  // still get the same JSON shape the frontend expects, instead of
  // Express's default HTML error page.
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      ApiResponse.error(res, err);
    },
  );

  return app;
}

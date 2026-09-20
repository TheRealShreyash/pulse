import express from "express";
import type { NextFunction, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import { FRONTEND_URL, NODE_ENV } from "../config";
import pollRouter from "./modules/poll/poll.routes";
import { ApiResponse } from "./common/utils";
import { auth } from "../lib/auth";
import { globalLimiter } from "./common/middlewares/rate-limit.middleware";

export function createApplication() {
  const app = express();

  // Render (and Vercel's rewrite in front of it) sit between clients and
  // this server, so without this every request looks like it comes from the
  // proxy's own IP — express-rate-limit would then lump every real visitor
  // into one shared bucket instead of limiting them individually.
  if (NODE_ENV.toLowerCase() === "production") {
    app.set("trust proxy", 1);
  }

  // Better Auth (Google sign-in) reads the raw request body itself, so its
  // handler must be mounted before express.json() consumes the stream.
  // Mounted at a base path distinct from /api/auth (Iris's routes) — Better
  // Auth's handler never calls next(), so sharing that prefix would swallow
  // Iris's own routes instead of falling through to them.
  app.all("/api/better-auth/*splat", toNodeHandler(auth));

  app.use(globalLimiter);
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

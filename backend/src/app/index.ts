import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import { FRONTEND_URL } from "../config";

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

  app.get("/health", (_, res) => {
    return res.json({ success: true, status: "Healthy" });
  });

  return app;
}

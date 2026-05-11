import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRouter = Router();

authRouter.get("/iris-login", AuthController.handleIrisLogin);
authRouter.get("/callback", AuthController.handleCallback);
authRouter.get('/refresh-token', AuthController.handleRefreshToken)

export default authRouter;

import { Router } from "express";
import { AuthController } from "./auth.controller";
import validate from "../../common/middlewares/validate.middleware";
import { updateUsernamePayloadModel } from "./auth.models";
import {
  authenticate,
  restrictToAuthenticatedUser,
} from "../../common/middlewares/authenticate.middleware";

const authRouter = Router();

authRouter.get("/iris-login", AuthController.handleIrisLogin);
authRouter.get("/iris-signup", AuthController.handleIrisSignup);
authRouter.get("/callback", AuthController.handleCallback);
authRouter.post("/refresh-token", AuthController.handleRefreshToken);
authRouter.post("/logout", AuthController.handleLogout);
authRouter.get(
  "/me",
  authenticate(),
  restrictToAuthenticatedUser(),
  AuthController.handleMe,
);
authRouter.patch(
  "/username",
  authenticate(),
  restrictToAuthenticatedUser(),
  validate(updateUsernamePayloadModel),
  AuthController.handleUpdateUsername,
);
authRouter.post(
  "/userinfo",
  authenticate(),
  restrictToAuthenticatedUser(),
  AuthController.handleUserInfo,
);

export default authRouter;

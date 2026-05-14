import { Router } from "express";
import validate from "../../common/middlewares/validate.middleware";
import { createPollPayloadModel } from "./poll.models";
import PollController from "./poll.controller";
import {
  authenticate,
  restrictToAuthenticatedUser,
} from "../../common/middlewares/authenticate.middleware";

const pollRouter = Router();

pollRouter.post(
  "/create",
  authenticate(),
  restrictToAuthenticatedUser(),
  validate(createPollPayloadModel),
  PollController.handleCreatePoll,
);

pollRouter.get(
  "/poll",
  authenticate(),
  restrictToAuthenticatedUser(),
  PollController.handleGetPoll,
);

pollRouter.get(
  "/user-polls",
  authenticate(),
  restrictToAuthenticatedUser(),
  PollController.handleGetUserPolls,
);

pollRouter.patch(
  "/publish",
  authenticate(),
  restrictToAuthenticatedUser(),
  PollController.handlePublish,
);

pollRouter.patch(
  "/close",
  authenticate(),
  restrictToAuthenticatedUser(),
  PollController.handleClose,
);

export default pollRouter;

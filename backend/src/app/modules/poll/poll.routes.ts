import { Router } from "express";
import validate from "../../common/middlewares/validate.middleware";
import { createPollPayloadModel, responsePayloadModel } from "./poll.models";
import PollController from "./poll.controller";
import {
  authenticate,
  pollAuthenticate,
  restrictToAuthenticatedUser,
} from "../../common/middlewares/authenticate.middleware";
import {
  voteLimiter,
  createPollLimiter,
} from "../../common/middlewares/rate-limit.middleware";

const pollRouter = Router();

pollRouter.post(
  "/create",
  createPollLimiter,
  authenticate(),
  restrictToAuthenticatedUser(),
  validate(createPollPayloadModel),
  PollController.handleCreatePoll,
);

pollRouter.get(
  "/poll",
  pollAuthenticate(),
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

pollRouter.post(
  "/respond",
  voteLimiter,
  pollAuthenticate(),
  validate(responsePayloadModel),
  PollController.handleRespond,
);

pollRouter.get('/has-voted', pollAuthenticate(), PollController.handleHasVoted)

export default pollRouter;

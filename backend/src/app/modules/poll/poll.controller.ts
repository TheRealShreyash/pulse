import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils";
import {
  closePoll,
  createPoll,
  getPoll,
  getUserPolls,
  updatePoll,
} from "./poll.services";
import type { AuthenticatedRequest } from "../../common/utils/interfaces";

export default class PollController {
  static async handleCreatePoll(req: AuthenticatedRequest, res: Response) {
    try {
      const payload = req.body;
      const poll = await createPoll(payload, req.user!.sub);

      ApiResponse.ok(res, "Poll created", poll);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleGetUserPolls(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.sub;
      const polls = await getUserPolls(userId);

      ApiResponse.ok(res, "Polls found", polls);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleGetPoll(req: AuthenticatedRequest, res: Response) {
    try {
      const pollId = req.query.id as string;
      const pollData = await getPoll(pollId, req.user!.sub);

      ApiResponse.ok(res, "Found poll", pollData);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handlePublish(req: AuthenticatedRequest, res: Response) {
    try {
      const pollId = req.query.id as string;
      const creatorId = req.user!.sub;

      const updatedPoll = await updatePoll(pollId, creatorId);
      ApiResponse.ok(res, "Poll published", updatedPoll);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleClose(req: AuthenticatedRequest, res: Response) {
    try {
      const pollId = req.query.id as string;
      const creatorId = req.user!.sub;

      const updatedPoll = await closePoll(pollId, creatorId);
      ApiResponse.ok(res, "Poll closed", updatedPoll);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

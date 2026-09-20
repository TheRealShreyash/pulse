import type { Request, Response } from "express";
import { ApiError, ApiResponse } from "../../common/utils";
import {
  closePoll,
  createPoll,
  exportPollCsv,
  getPoll,
  getUserPolls,
  hasVoted,
  respond,
  updatePoll,
} from "./poll.services";
import { toCsv } from "./utils/csv";
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
      const pollData = await getPoll(pollId, req.user?.sub);

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

  static async handleRespond(req: AuthenticatedRequest, res: Response) {
    try {
      const payload = req.body;
      const userId = req.user?.sub ?? null;
      const responded = await respond(req, payload, userId);

      if (!responded) throw ApiError.internalError("Internal server error");

      ApiResponse.ok(res, "Response recorded");
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleHasVoted(req: AuthenticatedRequest, res: Response) {
    try {
      const pollId = req.query.id as string;
      const userId = req.user?.sub ?? null;
      const voted = await hasVoted(req, pollId, userId);
      ApiResponse.ok(res, "Vote status", { voted });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleExportCsv(req: AuthenticatedRequest, res: Response) {
    try {
      const pollId = req.query.id as string;
      const creatorId = req.user!.sub;

      const { title, rows } = await exportPollCsv(pollId, creatorId);
      const filename =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "poll";

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`,
      );
      res.send(toCsv(rows));
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

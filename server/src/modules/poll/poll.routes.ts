import { Router } from "express";
import { asyncHandler } from "../../lib/http";
import {
  createPoll,
  getAnalytics,
  getOwnedPoll,
  getPublicPoll,
  listPolls,
  publishPoll,
  submitPoll,
} from "./poll.controller";

export const pollRouter = Router();

pollRouter.get("/", asyncHandler(listPolls));
pollRouter.post("/", asyncHandler(createPoll));
pollRouter.get("/public/:slug", asyncHandler(getPublicPoll));
pollRouter.post("/public/:slug/submit", asyncHandler(submitPoll));
pollRouter.get("/:id", asyncHandler(getOwnedPoll));
pollRouter.get("/:id/analytics", asyncHandler(getAnalytics));
pollRouter.post("/:id/publish", asyncHandler(publishPoll));

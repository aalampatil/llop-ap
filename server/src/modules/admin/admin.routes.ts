import { Router } from "express";
import { asyncHandler } from "../../lib/http";
import { closePollAsAdmin, getAdminOverview } from "./admin.controller";

export const adminRouter = Router();

adminRouter.get("/overview", asyncHandler(getAdminOverview));
adminRouter.post("/polls/:id/close", asyncHandler(closePollAsAdmin));

import { Router } from "express";
import { asyncHandler } from "../../lib/http";
import { me } from "./user.controller";

export const userRouter = Router();

userRouter.get("/me", asyncHandler(me));

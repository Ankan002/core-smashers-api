import { login } from "controllers/auth";
import { Router } from "express";

export const authRouter = Router();

authRouter.route("/login").post(login);
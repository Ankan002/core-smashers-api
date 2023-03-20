import { getQuestions } from "controllers/question";
import { Router } from "express";
import { isAuthenticated } from "middlewares/auth";

export const questionRouter = Router();

questionRouter.route("/questions").get(isAuthenticated, getQuestions);

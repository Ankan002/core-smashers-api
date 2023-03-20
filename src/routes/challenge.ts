import { getChallenges, getChallenge } from "controllers/challenges";
import { Router } from "express";
import { isAuthenticated } from "middlewares/auth";

export const challengeRouter = Router();

challengeRouter.route("/").get(isAuthenticated, getChallenges);
challengeRouter.route("/challenge/:id").get(isAuthenticated, getChallenge);

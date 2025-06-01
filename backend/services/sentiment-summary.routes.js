import express from "express";
import SentimentSummaryController from "../controllers/sentiment-summary.controller.js";

const router = express.Router();

router.get("/user/:userId", SentimentSummaryController.getUserSummary);
router.get("/dashboard", SentimentSummaryController.getDashboardSummary);

export default router;

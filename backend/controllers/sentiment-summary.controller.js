import SentimentSummaryService from "../services/sentiment-summary.service.js";

const getUserSummary = async (req, res) => {
    const { userId } = req.params;
    const summary = await SentimentSummaryService.getUserSentimentSummary(userId);
    if (!summary) return res.status(404).json({ error: "No data" });
    res.json(summary);
};

const getDashboardSummary = async (req, res) => {
    const summary = await SentimentSummaryService.getDashboardSentimentSummary();
    res.json(summary);
};

export default {
    getUserSummary,
    getDashboardSummary,
};

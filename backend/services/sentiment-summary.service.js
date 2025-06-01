import { supabaseAdmin } from "./supabase.service.js";

class SentimentSummaryService {
    async getUserSentimentSummary(userId) {
        if (!userId) return null;
        const { data: sessions } = await supabaseAdmin
            .from("sessions")
            .select(
                `id, created_at, message(id, created_at, sentiment_analysis(analysis_data))`
            )
            .eq("user_id", userId)
            .eq("type", "chatbot")
            .order("created_at", { ascending: true });

        let allSentiments = [];
        let timeline = [];
        let messageCount = 0;
        let sessionsCount = 0;
        let lastActivity = null;
        let llmInterpretation = null;

        if (sessions && sessions.length) {
            sessionsCount = sessions.length;
            sessions.forEach((session) => {
                if (session.message && session.message.length) {
                    session.message.forEach((msg) => {
                        if (msg.sentiment_analysis && msg.sentiment_analysis.length) {
                            const analysisData = msg.sentiment_analysis[0].analysis_data;
                            const s = analysisData?.overall;
                            if (s) {
                                allSentiments.push({ ...s, date: msg.created_at });
                                timeline.push({
                                    date: msg.created_at.split("T")[0],
                                    compound: s.compound,
                                    positive: s.positive,
                                    negative: s.negative,
                                    neutral: s.neutral,
                                });
                                lastActivity = msg.created_at;
                            }
                            // Find first LLM interpretation if available
                            if (!llmInterpretation && analysisData?.llmInterpretation) {
                                llmInterpretation = analysisData.llmInterpretation;
                            }
                        }
                        messageCount++;
                    });
                }
            });
        }

        let overall = { compound: 0, positive: 0, negative: 0, neutral: 0, category: "neutral", intensity: 0 };
        if (allSentiments.length) {
            overall.compound = allSentiments.reduce((a, b) => a + b.compound, 0) / allSentiments.length;
            overall.positive = allSentiments.reduce((a, b) => a + b.positive, 0) / allSentiments.length;
            overall.negative = allSentiments.reduce((a, b) => a + b.negative, 0) / allSentiments.length;
            overall.neutral = allSentiments.reduce((a, b) => a + b.neutral, 0) / allSentiments.length;
            overall.intensity = allSentiments.reduce((a, b) => a + b.intensity, 0) / allSentiments.length;
            overall.category = overall.compound > 0.05 ? "positive" : overall.compound < -0.05 ? "negative" : "neutral";
        }

        const averageSessionLength = sessionsCount ? (messageCount / sessionsCount).toFixed(1) : 0;
        const topEmotions = [];
        let riskLevel = "low";
        let trends = { improvement: false, stabilizing: false, concerning: false };

        if (timeline.length > 1) {
            const first = timeline[0].compound, last = timeline[timeline.length - 1].compound;
            trends.improvement = last > first;
            trends.stabilizing = Math.abs(last - first) < 0.1;
            trends.concerning = overall.category === "negative";
            riskLevel = overall.category === "negative" ? "moderate" : "low";
        }

        return {
            overall,
            timeline,
            messageCount,
            sessionsCount,
            averageSessionLength,
            topEmotions,
            riskLevel,
            lastActivity,
            trends,
            llmInterpretation
        };
    }

    async getDashboardSentimentSummary() {
        const { data } = await supabaseAdmin
            .from("sentiment_analysis")
            .select("analysis_data")
            .order("created_at", { ascending: true });

        let all = [];
        if (data && data.length) {
            data.forEach((row) => {
                const s = row.analysis_data?.overall;
                if (s) all.push(s);
            });
        }
        let overall = { compound: 0, positive: 0, negative: 0, neutral: 0, category: "neutral", intensity: 0 };
        if (all.length) {
            overall.compound = all.reduce((a, b) => a + b.compound, 0) / all.length;
            overall.positive = all.reduce((a, b) => a + b.positive, 0) / all.length;
            overall.negative = all.reduce((a, b) => a + b.negative, 0) / all.length;
            overall.neutral = all.reduce((a, b) => a + b.neutral, 0) / all.length;
            overall.intensity = all.reduce((a, b) => a + b.intensity, 0) / all.length;
            overall.category = overall.compound > 0.05 ? "positive" : overall.compound < -0.05 ? "negative" : "neutral";
        }
        return { overall, count: all.length };
    }
}

export default new SentimentSummaryService();

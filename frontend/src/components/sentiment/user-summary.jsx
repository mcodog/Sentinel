import React, { useEffect, useState } from "react";
import {
  SentimentSummaryCards,
  SentimentPieChart,
  SentimentTimelineChart,
  CompoundScoreGauge,
  SentimentAreaChart,
  fetchUserSentimentSummary,
} from "./chart";

const UserSentimentSummary = ({ userId, userName = "Patient" }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserSentimentSummary(userId).then(setSummary);
    }
  }, [userId]);

  if (!summary || !summary.overall) return <div className="p-6">Loading sentiment summary...</div>;

  const riskLevel = summary.riskLevel || "low";
  const trends = summary.trends || { improvement: false, stabilizing: false, concerning: false };
  const topEmotions = Array.isArray(summary.topEmotions) ? summary.topEmotions : [];
  const overall = summary.overall && typeof summary.overall === "object"
    ? {
        positive: Number(summary.overall.positive) || 0,
        negative: Number(summary.overall.negative) || 0,
        neutral: Number(summary.overall.neutral) || 0,
        compound: Number(summary.overall.compound) || 0,
        category: summary.overall.category || "neutral",
        intensity: Number(summary.overall.intensity) || 0,
      }
    : { positive: 0, negative: 0, neutral: 0, compound: 0, category: "neutral", intensity: 0 };

  const showPieChart =
    overall.positive !== 0 ||
    overall.negative !== 0 ||
    overall.neutral !== 0 ||
    overall.compound !== 0;

  const llm = summary.llmInterpretation?.analysis || null;
  const hasLLM = !!llm;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Sentiment Analysis Summary for {userName}
        </h2>
        <p className="text-gray-600">
          Mental health insights based on chat conversations and interactions
        </p>
      </div>

      {/* Summary Cards */}
      <SentimentSummaryCards data={overall} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Messages:</span>
              <span className="font-medium">{summary.messageCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chat Sessions:</span>
              <span className="font-medium">{summary.sessionsCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Session Length:</span>
              <span className="font-medium">{summary.averageSessionLength || 0} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-medium">{summary.lastActivity || "-"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Risk Assessment</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  trends.improvement ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Showing improvement</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  trends.stabilizing ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Mood stabilizing</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  trends.concerning ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Concerning patterns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Top Emotional Themes</h3>
          <div className="flex flex-wrap gap-2">
            {topEmotions.length > 0 ? topEmotions.map((emotion, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {emotion}
              </span>
            )) : <span className="text-gray-400 text-sm">No data</span>}
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Derived from natural language processing of chat messages
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showPieChart && (
          <SentimentPieChart 
            data={overall} 
            title="Overall Sentiment Distribution"
          />
        )}
        <CompoundScoreGauge 
          score={overall.compound}
          title="Mental Wellness Score"
        />
      </div>

      {/* Timeline Chart */}
      <SentimentTimelineChart 
        data={summary.timeline || []}
        title="Sentiment Trends Over Time"
      />

      {/* Area Chart */}
      <SentimentAreaChart 
        data={summary.timeline || []}
        title="Emotional State Distribution Over Time"
      />

      {/* Clinical Notes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Clinical Insights</h3>
        {hasLLM ? (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-800">LLM Interpretation</h4>
              <div className="text-gray-600 text-sm mt-1">
                <div>
                  <span className="font-semibold">Emotional State:</span> {llm.interpretation?.emotional_state || "-"}
                </div>
                <div>
                  <span className="font-semibold">Contextual Meaning:</span> {llm.interpretation?.contextual_meaning || "-"}
                </div>
                <div>
                  <span className="font-semibold">Psychological Indicators:</span> {Array.isArray(llm.interpretation?.psychological_indicators) ? llm.interpretation.psychological_indicators.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Communication Style:</span> {llm.interpretation?.communication_style || "-"}
                </div>
              </div>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-gray-800">LLM Analytics & Insights</h4>
              <div className="text-gray-600 text-sm mt-1">
                <div>
                  <span className="font-semibold">Sentiment Strength:</span> {llm.analytics?.sentiment_strength || "-"}
                </div>
                <div>
                  <span className="font-semibold">Emotional Complexity:</span> {llm.analytics?.emotional_complexity ?? "-"}
                </div>
                <div>
                  <span className="font-semibold">Language Patterns:</span> {Array.isArray(llm.analytics?.language_patterns) ? llm.analytics.language_patterns.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Risk Indicators:</span> {Array.isArray(llm.analytics?.risk_indicators) ? llm.analytics.risk_indicators.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Positive Indicators:</span> {Array.isArray(llm.analytics?.positive_indicators) ? llm.analytics.positive_indicators.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Primary Emotion:</span> {llm.insights?.primary_emotion || "-"}
                </div>
                <div>
                  <span className="font-semibold">Secondary Emotions:</span> {Array.isArray(llm.insights?.secondary_emotions) ? llm.insights.secondary_emotions.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Emotional Trajectory:</span> {llm.insights?.emotional_trajectory || "-"}
                </div>
                <div>
                  <span className="font-semibold">Intervention Suggestions:</span> {Array.isArray(llm.insights?.intervention_suggestions) ? llm.insights.intervention_suggestions.join(", ") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Support Recommendations:</span> {Array.isArray(llm.insights?.support_recommendations) ? llm.insights.support_recommendations.join(", ") : "-"}
                </div>
              </div>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-800">LLM Clinical Notes</h4>
              <div className="text-gray-600 text-sm mt-1">
                <div>
                  <span className="font-semibold">Concern Level:</span> {llm.clinical_notes?.concern_level || "-"}
                </div>
                <div>
                  <span className="font-semibold">Follow Up Needed:</span> {llm.clinical_notes?.follow_up_needed !== undefined ? (llm.clinical_notes.follow_up_needed ? "Yes" : "No") : "-"}
                </div>
                <div>
                  <span className="font-semibold">Professional Referral:</span> {llm.clinical_notes?.professional_referral || "-"}
                </div>
                <div>
                  <span className="font-semibold">Urgency Score:</span> {llm.clinical_notes?.urgency_score ?? "-"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-800">Key Observations</h4>
              <p className="text-gray-600 text-sm mt-1">
                Patient shows fluctuating mood patterns with predominant negative sentiment. 
                Regular engagement with the chatbot indicates willingness to seek support.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-gray-800">Recommendations</h4>
              <p className="text-gray-600 text-sm mt-1">
                Consider scheduling a follow-up session to address recurring anxiety themes. 
                Monitor for crisis indicators and ensure appropriate support resources are available.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-800">Positive Indicators</h4>
              <p className="text-gray-600 text-sm mt-1">
                Patient demonstrates self-awareness and actively engages in conversations about mental health. 
                Shows resilience in seeking help through digital channels.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSentimentSummary;
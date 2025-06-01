import React from "react";
import {
  SentimentSummaryCards,
  SentimentPieChart,
  SentimentTimelineChart,
  CompoundScoreGauge,
  SentimentAreaChart,
} from "./chart";

// Mock sentiment data for testing
const mockSentimentData = {
  overall: {
    compound: -0.2345,
    positive: 0.15,
    negative: 0.45,
    neutral: 0.40,
    category: "negative",
    intensity: 0.2345
  },
  timeline: [
    { date: "2025-05-20", compound: -0.4, positive: 0.1, negative: 0.6, neutral: 0.3 },
    { date: "2025-05-21", compound: -0.2, positive: 0.2, negative: 0.4, neutral: 0.4 },
    { date: "2025-05-22", compound: 0.1, positive: 0.4, negative: 0.2, neutral: 0.4 },
    { date: "2025-05-23", compound: -0.1, positive: 0.3, negative: 0.3, neutral: 0.4 },
    { date: "2025-05-24", compound: -0.3, positive: 0.1, negative: 0.5, neutral: 0.4 },
    { date: "2025-05-25", compound: 0.0, positive: 0.3, negative: 0.3, neutral: 0.4 },
    { date: "2025-05-26", compound: -0.1, positive: 0.2, negative: 0.4, neutral: 0.4 },
  ],
  messageCount: 45,
  sessionsCount: 8,
  averageSessionLength: 12.5,
  topEmotions: ["anxiety", "sadness", "hope", "worry"],
  riskLevel: "moderate",
  lastActivity: "2025-05-26",
  trends: {
    improvement: false,
    stabilizing: true,
    concerning: true
  }
};

const UserSentimentSummary = ({ userId, userName = "Patient" }) => {
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
      <SentimentSummaryCards data={mockSentimentData.overall} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Messages:</span>
              <span className="font-medium">{mockSentimentData.messageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chat Sessions:</span>
              <span className="font-medium">{mockSentimentData.sessionsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Session Length:</span>
              <span className="font-medium">{mockSentimentData.averageSessionLength} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-medium">{mockSentimentData.lastActivity}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Risk Assessment</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                mockSentimentData.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                mockSentimentData.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {mockSentimentData.riskLevel.charAt(0).toUpperCase() + mockSentimentData.riskLevel.slice(1)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  mockSentimentData.trends.improvement ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Showing improvement</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  mockSentimentData.trends.stabilizing ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Mood stabilizing</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  mockSentimentData.trends.concerning ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-600">Concerning patterns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Top Emotional Themes</h3>
          <div className="flex flex-wrap gap-2">
            {mockSentimentData.topEmotions.map((emotion, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {emotion}
              </span>
            ))}
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
        <SentimentPieChart 
          data={mockSentimentData.overall} 
          title="Overall Sentiment Distribution"
        />
        <CompoundScoreGauge 
          score={mockSentimentData.overall.compound}
          title="Mental Wellness Score"
        />
      </div>

      {/* Timeline Chart */}
      <SentimentTimelineChart 
        data={mockSentimentData.timeline}
        title="Sentiment Trends Over Time"
      />

      {/* Area Chart */}
      <SentimentAreaChart 
        data={mockSentimentData.timeline}
        title="Emotional State Distribution Over Time"
      />

      {/* Clinical Notes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Clinical Insights</h3>
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
      </div>
    </div>
  );
};

export default UserSentimentSummary;
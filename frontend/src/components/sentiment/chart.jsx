import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import axiosInstance from "../../utils/axios";

const SENTIMENT_COLORS = {
  positive: "#10B981",
  negative: "#EF4444",
  neutral: "#6B7280",
  compound: "#3B82F6",
};

// Pie Chart for Sentiment Distribution
export const SentimentPieChart = ({ data, title = "Sentiment Distribution" }) => {
  const safeData = data || { positive: 0, negative: 0, neutral: 0 };
  const pieData = [
    { name: "Positive", value: (safeData.positive || 0) * 100, color: SENTIMENT_COLORS.positive },
    { name: "Negative", value: (safeData.negative || 0) * 100, color: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: (safeData.neutral || 0) * 100, color: SENTIMENT_COLORS.neutral },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Percentage"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart for Sentiment Metrics
export const SentimentBarChart = ({ data, title = "Sentiment Metrics" }) => {
  const safeData = data || { positive: 0, negative: 0, neutral: 0 };
  const barData = [
    { name: "Positive", value: (safeData.positive || 0) * 100, fill: SENTIMENT_COLORS.positive },
    { name: "Negative", value: (safeData.negative || 0) * 100, fill: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: (safeData.neutral || 0) * 100, fill: SENTIMENT_COLORS.neutral },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Percentage"]} />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Line Chart for Sentiment Timeline
export const SentimentTimelineChart = ({ data, title = "Sentiment Over Time" }) => {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[-1, 1]} />
          <Tooltip 
            formatter={(value, name) => [value?.toFixed ? value.toFixed(3) : value, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="compound" 
            stroke={SENTIMENT_COLORS.compound}
            strokeWidth={2}
            name="Compound Score"
          />
          <Line 
            type="monotone" 
            dataKey="positive" 
            stroke={SENTIMENT_COLORS.positive}
            strokeWidth={2}
            name="Positive"
          />
          <Line 
            type="monotone" 
            dataKey="negative" 
            stroke={SENTIMENT_COLORS.negative}
            strokeWidth={2}
            name="Negative"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area Chart for Sentiment Intensity
export const SentimentAreaChart = ({ data, title = "Sentiment Intensity Trends" }) => {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} />
          <Tooltip 
            formatter={(value, name) => [value?.toFixed ? value.toFixed(3) : value, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="positive" 
            stackId="1"
            stroke={SENTIMENT_COLORS.positive}
            fill={SENTIMENT_COLORS.positive}
            fillOpacity={0.6}
            name="Positive"
          />
          <Area 
            type="monotone" 
            dataKey="neutral" 
            stackId="1"
            stroke={SENTIMENT_COLORS.neutral}
            fill={SENTIMENT_COLORS.neutral}
            fillOpacity={0.6}
            name="Neutral"
          />
          <Area 
            type="monotone" 
            dataKey="negative" 
            stackId="1"
            stroke={SENTIMENT_COLORS.negative}
            fill={SENTIMENT_COLORS.negative}
            fillOpacity={0.6}
            name="Negative"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Compound Score Gauge Chart
export const CompoundScoreGauge = ({ score, title = "Overall Sentiment Score" }) => {
  const safeScore = typeof score === "number" && !isNaN(score) ? score : 0;
  const getScoreColor = (score) => {
    if (score >= 0.05) return SENTIMENT_COLORS.positive;
    if (score <= -0.05) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };

  const getScoreLabel = (score) => {
    if (score >= 0.05) return "Positive";
    if (score <= -0.05) return "Negative";
    return "Neutral";
  };

  const normalizedScore = ((safeScore + 1) / 2) * 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={getScoreColor(safeScore)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${normalizedScore * 2.51}, 251.2`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: getScoreColor(safeScore) }}>
              {safeScore.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">{getScoreLabel(safeScore)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Cards Component
export const SentimentSummaryCards = ({ data }) => {
  const safeData = data || { positive: 0, negative: 0, neutral: 0, compound: 0 };
  const cards = [
    {
      title: "Positive Messages",
      value: `${(safeData.positive * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.positive,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
    },
    {
      title: "Negative Messages",
      value: `${(safeData.negative * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.negative,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
    },
    {
      title: "Neutral Messages",
      value: `${(safeData.neutral * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.neutral,
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
    },
    {
      title: "Overall Score",
      value: safeData.compound.toFixed(3),
      color: SENTIMENT_COLORS.compound,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} p-4 rounded-lg`}>
          <div className={`text-2xl font-bold ${card.textColor}`}>
            {card.value}
          </div>
          <div className="text-sm text-gray-600">{card.title}</div>
        </div>
      ))}
    </div>
  );
};

export const fetchUserSentimentSummary = async (userId) => {
  const { data } = await axiosInstance.get(`/sentiment-summary/user/${userId}`);
  return data;
};

export const fetchDashboardSentimentSummary = async () => {
  const { data } = await axiosInstance.get(`/sentiment-summary/dashboard`);
  return data;
};

export default {
  SentimentPieChart,
  SentimentBarChart,
  SentimentTimelineChart,
  SentimentAreaChart,
  CompoundScoreGauge,
  SentimentSummaryCards,
};
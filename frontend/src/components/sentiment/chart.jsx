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

const SENTIMENT_COLORS = {
  positive: "#10B981",
  negative: "#EF4444",
  neutral: "#6B7280",
  compound: "#3B82F6",
};

// Pie Chart for Sentiment Distribution
export const SentimentPieChart = ({ data, title = "Sentiment Distribution" }) => {
  const pieData = [
    { name: "Positive", value: data.positive * 100, color: SENTIMENT_COLORS.positive },
    { name: "Negative", value: data.negative * 100, color: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: data.neutral * 100, color: SENTIMENT_COLORS.neutral },
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
  const barData = [
    { name: "Positive", value: data.positive * 100, fill: SENTIMENT_COLORS.positive },
    { name: "Negative", value: data.negative * 100, fill: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: data.neutral * 100, fill: SENTIMENT_COLORS.neutral },
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
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[-1, 1]} />
          <Tooltip 
            formatter={(value, name) => [value.toFixed(3), name]}
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
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 1]} />
          <Tooltip 
            formatter={(value, name) => [value.toFixed(3), name]}
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

  const normalizedScore = ((score + 1) / 2) * 100; // Convert -1 to 1 scale to 0-100

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={getScoreColor(score)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${normalizedScore * 2.51}, 251.2`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: getScoreColor(score) }}>
              {score.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">{getScoreLabel(score)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Cards Component
export const SentimentSummaryCards = ({ data }) => {
  const cards = [
    {
      title: "Positive Messages",
      value: `${(data.positive * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.positive,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
    },
    {
      title: "Negative Messages",
      value: `${(data.negative * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.negative,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
    },
    {
      title: "Neutral Messages",
      value: `${(data.neutral * 100).toFixed(1)}%`,
      color: SENTIMENT_COLORS.neutral,
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
    },
    {
      title: "Overall Score",
      value: data.compound.toFixed(3),
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

export default {
  SentimentPieChart,
  SentimentBarChart,
  SentimentTimelineChart,
  SentimentAreaChart,
  CompoundScoreGauge,
  SentimentSummaryCards,
};
import React, { useState, useEffect } from 'react';
import {
  SentimentPieChart,
  SentimentBarChart,
  SentimentTimelineChart,
  SentimentAreaChart,
  CompoundScoreGauge,
  SentimentSummaryCards,
  fetchDashboardSentimentSummary
} from './chart';
import { TbReportAnalytics, TbUsers, TbTrendingUp, TbAlertTriangle } from 'react-icons/tb';

const DashboardOverview = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboardSentimentSummary().then(setDashboard);
  }, []);

  const timeRangeOptions = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: '1 Year' }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TbTrendingUp className="text-red-500" size={16} />;
    if (trend === 'down') return <TbTrendingUp className="text-green-500 rotate-180" size={16} />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
  };

  if (!dashboard || !dashboard.overall) {
    return <div className="p-6">Loading dashboard overview...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sentiment Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of patient sentiment patterns</p>
        </div>
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.count || 0}</p>
            </div>
            <TbUsers className="text-blue-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Active in selected period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sentiment Score</p>
              <p className="text-3xl font-bold text-gray-900">{dashboard.overall.compound?.toFixed(3)}</p>
            </div>
            <TbReportAnalytics className="text-purple-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Compound sentiment average</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">At-Risk Patients</p>
              <p className="text-3xl font-bold text-red-600">{dashboard.riskPatients || 0}</p>
            </div>
            <TbAlertTriangle className="text-red-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Requiring immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive Trend</p>
              <p className="text-3xl font-bold text-green-600">{dashboard.positiveTrend || 0}</p>
            </div>
            <TbTrendingUp className="text-green-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Patients improving</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment Distribution</h3>
          <SentimentPieChart data={{
            positive: dashboard.overall.positive || 0,
            negative: dashboard.overall.negative || 0,
            neutral: dashboard.overall.neutral || 0
          }} />
        </div>

        {/* Compound Score Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Compound Score</h3>
          <CompoundScoreGauge score={dashboard.overall.compound || 0} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

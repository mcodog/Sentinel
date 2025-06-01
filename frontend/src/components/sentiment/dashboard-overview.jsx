import React, { useState, useEffect } from 'react';
import {
  SentimentPieChart,
  SentimentBarChart,
  SentimentTimelineChart,
  SentimentAreaChart,
  CompoundScoreGauge,
  SentimentSummaryCards
} from './chart';
import { TbReportAnalytics, TbUsers, TbTrendingUp, TbAlertTriangle } from 'react-icons/tb';

const DashboardOverview = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  // Mock aggregate data for dashboard
  const aggregateData = {
    totalPatients: 42,
    avgCompoundScore: -0.1234,
    riskPatients: 8,
    trends: {
      positive: 12,
      neutral: 22,
      negative: 8
    },
    sentimentDistribution: [
      { name: 'Positive', value: 28.6, count: 12, color: '#10B981' },
      { name: 'Neutral', value: 52.4, count: 22, color: '#6B7280' },
      { name: 'Negative', value: 19.0, count: 8, color: '#EF4444' }
    ],
    weeklyTrends: [
      { date: '2024-05-20', positive: 65, neutral: 25, negative: 10, compound: 0.45 },
      { date: '2024-05-21', positive: 58, neutral: 30, negative: 12, compound: 0.32 },
      { date: '2024-05-22', positive: 72, neutral: 20, negative: 8, compound: 0.58 },
      { date: '2024-05-23', positive: 45, neutral: 35, negative: 20, compound: 0.15 },
      { date: '2024-05-24', positive: 62, neutral: 28, negative: 10, compound: 0.41 },
      { date: '2024-05-25', positive: 55, neutral: 32, negative: 13, compound: 0.28 },
      { date: '2024-05-26', positive: 68, neutral: 25, negative: 7, compound: 0.52 }
    ],
    topConcerns: [
      { concern: 'Anxiety', frequency: 34, trend: 'up' },
      { concern: 'Depression', frequency: 28, trend: 'stable' },
      { concern: 'Sleep Issues', frequency: 22, trend: 'down' },
      { concern: 'Stress', frequency: 19, trend: 'up' },
      { concern: 'Relationship', frequency: 15, trend: 'stable' }
    ],
    riskPatientsList: [
      { id: 1, name: 'Patient A', compoundScore: -0.789, lastSession: '2024-05-26', riskLevel: 'High' },
      { id: 2, name: 'Patient B', compoundScore: -0.654, lastSession: '2024-05-25', riskLevel: 'High' },
      { id: 3, name: 'Patient C', compoundScore: -0.543, lastSession: '2024-05-24', riskLevel: 'Medium' },
      { id: 4, name: 'Patient D', compoundScore: -0.456, lastSession: '2024-05-23', riskLevel: 'Medium' }
    ]
  };

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
              <p className="text-3xl font-bold text-gray-900">{aggregateData.totalPatients}</p>
            </div>
            <TbUsers className="text-blue-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Active in selected period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sentiment Score</p>
              <p className="text-3xl font-bold text-gray-900">{aggregateData.avgCompoundScore.toFixed(3)}</p>
            </div>
            <TbReportAnalytics className="text-purple-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Compound sentiment average</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">At-Risk Patients</p>
              <p className="text-3xl font-bold text-red-600">{aggregateData.riskPatients}</p>
            </div>
            <TbAlertTriangle className="text-red-600" size={32} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Requiring immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive Trend</p>
              <p className="text-3xl font-bold text-green-600">{aggregateData.trends.positive}</p>
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
            positive: aggregateData.sentimentDistribution.find(s => s.name === 'Positive')?.value / 100 || 0,
            negative: aggregateData.sentimentDistribution.find(s => s.name === 'Negative')?.value / 100 || 0,
            neutral: aggregateData.sentimentDistribution.find(s => s.name === 'Neutral')?.value / 100 || 0
          }} />
        </div>

        {/* Compound Score Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Compound Score</h3>
          <CompoundScoreGauge score={aggregateData.avgCompoundScore} />
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trends Over Time</h3>
          <SentimentAreaChart data={aggregateData.weeklyTrends} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Concerns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Patient Concerns</h3>
          <div className="space-y-3">
            {aggregateData.topConcerns.map((concern, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{concern.concern}</span>
                  {getTrendIcon(concern.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{concern.frequency} mentions</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(concern.frequency / 34) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* At-Risk Patients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients Requiring Attention</h3>
          <div className="space-y-3">
            {aggregateData.riskPatientsList.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-600">Score: {patient.compoundScore}</p>
                  <p className="text-xs text-gray-500">Last session: {patient.lastSession}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                  {patient.riskLevel} Risk
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            View All Patients
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

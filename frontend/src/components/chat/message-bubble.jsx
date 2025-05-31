import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertTriangle, Heart, Brain, TrendingUp, TrendingDown } from 'lucide-react';

const MessageBubble = ({ message, isUser, timestamp, sentiment, isCrisisResponse }) => {
  const [showSentiment, setShowSentiment] = useState(false);

  // Get sentiment color and icon
  const getSentimentDisplay = (sentimentData) => {
    if (!sentimentData || !sentimentData.overall) return null;

    const { category, compound } = sentimentData.overall;
    
    const sentimentConfig = {
      'very_negative': { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Very Negative' },
      'negative': { color: 'text-red-500', bg: 'bg-red-50', icon: TrendingDown, label: 'Negative' },
      'neutral': { color: 'text-gray-500', bg: 'bg-gray-50', icon: Brain, label: 'Neutral' },
      'positive': { color: 'text-green-500', bg: 'bg-green-50', icon: TrendingUp, label: 'Positive' },
      'very_positive': { color: 'text-green-600', bg: 'bg-green-50', icon: Heart, label: 'Very Positive' }
    };

    return sentimentConfig[category] || sentimentConfig.neutral;
  };

  const sentimentDisplay = getSentimentDisplay(sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-slate-600 text-white' 
            : isCrisisResponse 
              ? 'bg-red-500 text-white'
              : 'bg-slate-500 text-white'
        }`}>
          {isUser ? <User size={12} className="md:hidden" /> : <Bot size={12} className="md:hidden" />}
          {isUser ? <User size={16} className="hidden md:block" /> : <Bot size={16} className="hidden md:block" />}
        </div>
        
        {/* Message Content */}
        <div className="flex flex-col gap-1">
          <div className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl ${
            isUser 
              ? 'bg-slate-600 text-white rounded-br-md' 
              : isCrisisResponse
                ? 'bg-red-50 border-2 border-red-200 text-red-900 rounded-bl-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}>
            {isCrisisResponse && (
              <div className="flex items-center gap-2 mb-2 text-red-600">
                <AlertTriangle size={16} />
                <span className="text-xs font-medium">Crisis Support Response</span>
              </div>
            )}
            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
            <div className="flex items-center justify-between mt-1">
              {timestamp && (
                <p className={`text-xs ${
                  isUser ? 'text-slate-200' : isCrisisResponse ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              
              {/* Sentiment indicator for user messages */}
              {isUser && sentimentDisplay && (
                <button
                  onClick={() => setShowSentiment(!showSentiment)}
                  className="ml-2 p-1 rounded-full hover:bg-slate-500 transition-colors"
                  title={`Sentiment: ${sentimentDisplay.label}`}
                >
                  <sentimentDisplay.icon size={12} className={sentimentDisplay.color} />
                </button>
              )}
            </div>
          </div>

          {/* Sentiment details (expandable) */}
          {isUser && showSentiment && sentimentDisplay && sentiment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`px-3 py-2 rounded-lg text-xs ${sentimentDisplay.bg}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <sentimentDisplay.icon size={14} className={sentimentDisplay.color} />
                <span className={`font-medium ${sentimentDisplay.color}`}>
                  {sentimentDisplay.label}
                </span>
                <span className="text-gray-600">
                  ({(sentiment.overall.compound * 100).toFixed(0)}%)
                </span>
              </div>
              {sentiment.translation?.wasTranslated && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Translated from:</span> {sentiment.translation.originalLanguage}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
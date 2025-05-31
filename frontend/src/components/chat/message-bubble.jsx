import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message, isUser, timestamp }) => {
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
            : 'bg-slate-500 text-white'
        }`}>
          {isUser ? <User size={12} className="md:hidden" /> : <Bot size={12} className="md:hidden" />}
          {isUser ? <User size={16} className="hidden md:block" /> : <Bot size={16} className="hidden md:block" />}
        </div>
        
        {/* Message Content */}
        <div className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl ${
          isUser 
            ? 'bg-slate-600 text-white rounded-br-md' 
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}>
          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          {timestamp && (
            <p className={`text-xs mt-1 ${
              isUser ? 'text-slate-200' : 'text-gray-500'
            }`}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
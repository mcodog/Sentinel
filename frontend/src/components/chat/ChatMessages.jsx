import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

const ChatMessages = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      return timestamp;
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">Start typing to begin your conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex max-w-xs lg:max-w-md items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-600 text-white'
            }`}>
              {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            {/* Message Content */}
            <div className={`px-4 py-2 rounded-2xl ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              {message.sender !== 'user' && message.name && (
                <p className="text-xs text-gray-500 mb-1">{message.name}</p>
              )}
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {formatTime(message.timestamp || message.time)}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
              <Bot size={16} />
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

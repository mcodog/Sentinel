import React from 'react';
import { Bot, Phone, Trash2 } from 'lucide-react';

const ChatHeader = ({ selectedChat, onDeleteSession }) => {
  return (
    <div className="p-4 border-b bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {selectedChat?.type === 'chatbot' ? 'AI Assistant' : 'Therapist Chat'}
            </h3>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onDeleteSession && (
            <button 
              onClick={onDeleteSession}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Delete session"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

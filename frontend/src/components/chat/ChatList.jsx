import React from 'react';
import { Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ conversations, selectedChatId, onSelectChat }) => {
  // Function to format the timestamp
  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  // If no conversations exist yet
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-gray-500 overflow-y-auto">
        <div>
          <p className="mb-2">No conversations yet</p>
          <p className="text-sm">Start a new chat to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {conversations.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 truncate">
                  {chat.type === 'chatbot' ? 'AI Assistant' : 'Therapist Chat'}
                </p>
                <span className="text-xs text-gray-500">{formatTimestamp(chat.date)}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {chat.conversation && chat.conversation.length > 0
                  ? chat.conversation[chat.conversation.length - 1]?.message
                  : 'No messages yet'}
              </p>
            </div>
            {chat.unread > 0 && (
              <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {chat.unread}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;

import React from 'react';
import { Plus } from 'lucide-react';

const NewChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 transition-colors"
    >
      <Plus size={18} />
      <span className="font-medium">New Conversation</span>
    </button>
  );
};

export default NewChatButton;

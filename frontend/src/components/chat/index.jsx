import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Trash2, Loader2 } from 'lucide-react';
import { FaComments } from 'react-icons/fa6';
import MessageBubble from './message-bubble';
import axiosInstance from '../../utils/axios';
import { selectUserId, selectIsLoggedIn } from '../../features/user/userSelector';

const ChatComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [anonymousChatEnabled, setAnonymousChatEnabled] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get user data from Redux store
  const userId = useSelector(selectUserId);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Check if anonymous chat is enabled when component mounts
  useEffect(() => {
    const checkAnonymousFeature = async () => {
      try {
        const response = await axiosInstance.get('/chatbot/anonymous-status');
        if (response.data.success) {
          setAnonymousChatEnabled(response.data.anonymousChatEnabled);
        }
      } catch (error) {
        console.warn('Failed to check anonymous chat status:', error);
        setAnonymousChatEnabled(false);
      }
    };

    checkAnonymousFeature();
  }, []);

  // Auto-enable anonymous mode if user is not logged in and feature is enabled
  useEffect(() => {
    if (!isLoggedIn && anonymousChatEnabled) {
      setIsAnonymousMode(true);
    } else if (isLoggedIn) {
      setIsAnonymousMode(false);
    }
  }, [isLoggedIn, anonymousChatEnabled]);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Load conversation history when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (isLoggedIn && userId) {
        loadConversationHistory();
      } else if (isAnonymousMode && sessionId) {
        loadAnonymousConversationHistory();
      } else if (isAnonymousMode && !sessionId) {
        // Generate a session ID for anonymous users
        const newSessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        setSessionId(newSessionId);
      }
    }
  }, [isOpen, isLoggedIn, userId, isAnonymousMode, sessionId]);

  const loadConversationHistory = async () => {
    if (!isLoggedIn || !userId) {
      console.warn('User not logged in, skipping conversation history load');
      return;
    }

    try {
      const response = await axiosInstance.get(`/chatbot/conversation/${userId}`);
      if (response.data.success && response.data.conversation) {
        setMessages(response.data.conversation);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const loadAnonymousConversationHistory = async () => {
    if (!sessionId) {
      console.warn('No session ID for anonymous user');
      return;
    }

    try {
      const response = await axiosInstance.get(`/chatbot/conversation/anonymous?sessionId=${sessionId}&isAnonymous=true`);
      if (response.data.success && response.data.conversation) {
        setMessages(response.data.conversation);
      }
    } catch (error) {
      console.error('Error loading anonymous conversation history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    // Check if user can send messages (either logged in or anonymous mode enabled)
    if (!isLoggedIn && !isAnonymousMode) {
      const errorMessage = {
        message: "Please log in to use the chat feature.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = {
      message: newMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (isAnonymousMode) {
        // Anonymous user request
        response = await axiosInstance.post('/chatbot/send', {
          message: userMessage.message,
          sessionId: sessionId,
          isAnonymous: true
        });
      } else {
        // Authenticated user request
        response = await axiosInstance.post('/chatbot/send', {
          message: userMessage.message,
          userId: userId,
          sessionId: sessionId,
          isAnonymous: false
        });
      }

      if (response.data.success) {
        const botMessage = {
          message: response.data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          sentiment: response.data.sentiment,
          isCrisisResponse: response.data.isCrisisResponse
        };
        setMessages(prev => [...prev, botMessage]);

        // Store session ID for conversation continuity
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        message: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = async () => {
    if (isAnonymousMode) {
      // Clear anonymous chat
      try {
        if (sessionId) {
          await axiosInstance.delete(`/chatbot/clear/anonymous?sessionId=${sessionId}&isAnonymous=true`);
        }
        setMessages([]);
        setSessionId(null);
      } catch (error) {
        console.error('Error clearing anonymous messages:', error);
        setMessages([]);
      }
    } else if (isLoggedIn && userId) {
      // Clear authenticated user chat
      try {
        await axiosInstance.delete(`/chatbot/clear/${userId}${sessionId ? `?sessionId=${sessionId}` : ''}`);
        setMessages([]);
        setSessionId(null);
      } catch (error) {
        console.error('Error clearing messages:', error);
        setMessages([]);
      }
    } else {
      // Fallback: just clear local messages
      setMessages([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="relative">
      {/* Floating Chat Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex border-4 p-3 px-6 md:p-4 md:px-8 rounded-4xl bg-slate-700 text-white gap-2 items-center cursor-pointer hover:bg-slate-600 transition-all duration-300 relative z-10"
      >
        <FaComments color="white" size="16" className="md:hidden" />
        <FaComments color="white" size="20" className="hidden md:block" />
        <p className="text-sm md:text-base">Chat</p>
      </motion.div>

      {/* Chat Modal with Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center md:items-end md:justify-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              // Responsive, flex layout, fixed height, and prevent overflow
              className="m-0 md:mb-4 md:mr-40 w-full max-w-full md:max-w-md h-screen md:h-[90vh] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-700 text-white p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sentinel AI</h3>
                    <p className="text-xs text-slate-200">
                      {isAnonymousMode ? 'Anonymous Mode' : 'Mental Health Support'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearMessages}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Clear conversation"
                    disabled={!isAnonymousMode && !isLoggedIn}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 chat-scroll min-h-0">
                {!isLoggedIn && !isAnonymousMode ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle size={48} className="mb-4 text-slate-400" />
                    <h4 className="font-medium mb-2">Login Required</h4>
                    <p className="text-sm text-center">
                      Please log in to access your personalized mental health support chat.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle size={48} className="mb-4 text-slate-400" />
                    <h4 className="font-medium mb-2">Welcome to Sentinel AI</h4>
                    <p className="text-sm text-center">
                      {isAnonymousMode ? 
                        "You're in anonymous mode. Your conversation won't be saved to your account. I'm here to provide mental health support and a safe space to talk. How can I help you today?" :
                        "I'm here to provide mental health support and a safe space to talk. How can I help you today?"
                      }
                    </p>
                    {isAnonymousMode && (
                      <div className="mt-3 p-2 bg-orange-100 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-700 text-center">
                          💡 Anonymous mode: Messages are stored temporarily and will be cleared when you close the browser.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {isAnonymousMode && messages.length > 0 && (
                      <div className="mb-4 p-2 bg-orange-100 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-700 text-center">
                          🔒 Anonymous session - Messages won't be saved to your account
                        </p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <MessageBubble
                        key={index}
                        message={msg.message}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                        sentiment={msg.sentiment}
                        isCrisisResponse={msg.isCrisisResponse}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-slate-500" />
                          <span className="text-sm text-gray-600">Sentinel is typing...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t flex-shrink-0">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isAnonymousMode ? "Type your message... (Anonymous mode)" :
                      isLoggedIn ? "Type your message..." : 
                      "Please log in to chat"
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    disabled={isLoading || (!isLoggedIn && !isAnonymousMode)}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading || (!isLoggedIn && !isAnonymousMode)}
                    className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatComponent;

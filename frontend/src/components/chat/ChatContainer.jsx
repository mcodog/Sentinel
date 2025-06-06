import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector";
import { backendActor } from "../../ic/actor";
import { encryptData } from "../../utils/blockchain.utils";

import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import NewChatButton from "./NewChatButton";
import chatService from "../../utils/chatService";

const ChatContainer = ({ setSentimentData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const userId = useSelector(selectUserId);

  // Fetch conversations when component mounts
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    const logActivity = async () => {
      try {
        const encrypted = await encryptData(
          {
            action: "User accessed the chat sessions",
            userId: userId,
            details: [],
          },
          "audit-log"
        );

        await backendActor.addActivityLog(encrypted);
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    };

    logActivity();
  }, [userId]);

  // Fetch conversation history from the backend
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatService.getConversations(userId);

      if (response?.conversations && Array.isArray(response.conversations)) {
        setConversations(response.conversations);

        // Extract sentiment data if available
        if (response.sentimentAnalysis && setSentimentData) {
          setSentimentData({
            overallSentiment:
              response.sentimentAnalysis.overallLabel || "neutral",
            recentTrend: response.sentimentAnalysis.trend || "stable",
            score: response.sentimentAnalysis.averageScore || 0,
          });
        }

        // Select the first conversation by default if available
        if (response.conversations.length > 0 && !selectedChat) {
          handleSelectChat(response.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);

    // Format messages for the selected chat
    if (chat.conversation && Array.isArray(chat.conversation)) {
      const formattedMessages = chat.conversation.map((msg) => ({
        sender: msg.sender === "user" ? "user" : "ai",
        message: msg.message,
        time: msg.time,
        name: msg.sender === "therapist" ? "AI Assistant" : null,
      }));
      setMessages(formattedMessages);

      // Update sentiment data if available
      if (chat.sentimentAnalysis && setSentimentData) {
        setSentimentData({
          overallSentiment: chat.sentimentAnalysis.label || "neutral",
          recentTrend: chat.sentimentAnalysis.trend || "stable",
          score: chat.sentimentAnalysis.score || 0,
        });
      }
    } else {
      setMessages([]);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    let currentSessionId = selectedChat?.id;

    // If no session is selected, create a new one first
    if (!currentSessionId) {
      try {
        const newSessionResponse = await chatService.initializeSession(userId);
        if (newSessionResponse.success && newSessionResponse.session) {
          const newSession = newSessionResponse.session;
          setConversations((prev) => [newSession, ...prev]);
          setSelectedChat(newSession);
          currentSessionId = newSession.id;
        } else {
          console.error("Failed to create new session");
          return;
        }
      } catch (error) {
        console.error("Error creating new session:", error);
        return;
      }
    }

    // Add user message to the UI immediately
    const userMessage = {
      sender: "user",
      message: message.trim(),
      time: format(new Date(), "h:mm a"),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to API
      const response = await chatService.sendMessage(
        message,
        userId,
        currentSessionId
      );

      if (response.success) {
        // Add bot response to the UI
        const botMessage = {
          sender: "ai",
          message: response.response,
          time: format(new Date(), "h:mm a"),
          name: "AI Assistant",
        };

        setMessages((prev) => [...prev, botMessage]);

        // If sentiment data is available, update it
        if (response.sentiment && setSentimentData) {
          const sentiment = response.sentiment;
          setSentimentData({
            overallSentiment: sentiment.label || "neutral",
            recentTrend: sentiment.trend || "stable",
            score: sentiment.score || 0,
          });
        }

        // Refresh conversations to update with new message
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message to the UI
      const errorMessage = {
        sender: "ai",
        message:
          "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        time: format(new Date(), "h:mm a"),
        name: "AI Assistant",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new chat
  const handleNewChat = async () => {
    try {
      setIsLoading(true);

      // Call the backend to initialize a new session
      const response = await chatService.initializeSession(userId);

      if (response.success && response.session) {
        // Add the new session to the conversations list
        const newSession = response.session;
        setConversations((prev) => [newSession, ...prev]);

        // Select the new session and clear messages
        setSelectedChat(newSession);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete the current chat session
  const handleDeleteSession = async () => {
    if (!selectedChat) return;

    try {
      setIsLoading(true);
      const response = await chatService.deleteSession(userId, selectedChat.id);

      if (response.success) {
        // Remove the session from conversations list
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== selectedChat.id)
        );

        // Clear current selection and messages
        setSelectedChat(null);
        setMessages([]);

        // If there are other conversations, select the first one
        const remainingConversations = conversations.filter(
          (conv) => conv.id !== selectedChat.id
        );
        if (remainingConversations.length > 0) {
          handleSelectChat(remainingConversations[0]);
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex bg-gray-50 h-screen max-h-screen">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col h-full max-h-screen">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        <NewChatButton onClick={handleNewChat} />

        <ChatList
          conversations={conversations}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full max-h-screen">
        {selectedChat || messages.length > 0 ? (
          <>
            <ChatHeader
              selectedChat={selectedChat}
              onDeleteSession={handleDeleteSession}
            />
            {/* Make ChatMessages take all available space and be scrollable */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>
            {/* Fix input at the bottom */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to AI Chat
              </h3>
              <p className="text-gray-600 mb-6">
                Select a conversation or start a new one
              </p>
              <button
                onClick={handleNewChat}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ChatContainer.propTypes = {
  setSentimentData: PropTypes.func,
};

ChatContainer.defaultProps = {
  setSentimentData: null,
};

export default ChatContainer;

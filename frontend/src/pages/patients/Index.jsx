import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser, selectUserId } from "../../features/user/userSelector";
import ChatContainer from "../../components/chat/ChatContainer";
import { encryptData } from "../../utils/blockchain.utils";
import { backendActor } from "../../ic/actor";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [selectedMood, setSelectedMood] = useState({
    emoji: "😊",
    label: "Happy",
    value: "happy",
    color: "bg-green-100 border-green-300 hover:bg-green-200",
  });
  const userId = useSelector(selectUserId);

  // Mood options
  const moodOptions = [
    {
      emoji: "😊",
      label: "Happy",
      value: "happy",
      color: "bg-green-100 border-green-300 hover:bg-green-200",
    },
    {
      emoji: "😢",
      label: "Sad",
      value: "sad",
      color: "bg-blue-100 border-blue-300 hover:bg-blue-200",
    },
    {
      emoji: "😰",
      label: "Anxious",
      value: "anxious",
      color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
    },
    {
      emoji: "😴",
      label: "Tired",
      value: "tired",
      color: "bg-purple-100 border-purple-300 hover:bg-purple-200",
    },
    {
      emoji: "😠",
      label: "Angry",
      value: "angry",
      color: "bg-red-100 border-red-300 hover:bg-red-200",
    },
    {
      emoji: "😐",
      label: "Neutral",
      value: "neutral",
      color: "bg-gray-100 border-gray-300 hover:bg-gray-200",
    },
    {
      emoji: "🤒",
      label: "Not Okay",
      value: "not_okay",
      color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
    },
    {
      emoji: "✨",
      label: "Great",
      value: "great",
      color: "bg-pink-100 border-pink-300 hover:bg-pink-200",
    },
  ];

  // State for managing sentiment analysis data
  const [sentimentData, setSentimentData] = useState({
    overallSentiment: "neutral",
    recentTrend: "stable",
    score: 0,
  });

  // Get user from Redux store
  const user = useSelector(selectUser);

  // Icon Components
  const Heart = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const User = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const MessageCircle = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );

  const Phone = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );

  const Bot = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const Send = ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );

  const LogOut = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
    setShowMoodCheck(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const logActivity = async () => {
      try {
        const encrypted = await encryptData(
          {
            action: "User accessed their dashboard",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Sentinel</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b">
            <div className="px-6 py-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === "chat"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Messages
                </button>
              </div>
            </div>
          </div>

          {/* Mood Check Modal */}
          {activeTab === "dashboard" && showMoodCheck && (
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    How are you feeling today?
                  </h2>
                  <p className="text-lg text-gray-600">
                    Let us know your current mood so we can better support you
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handleMoodSelection(mood)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${mood.color}`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-medium text-gray-700">
                          {mood.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Your mood helps us provide personalized support and
                    recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {activeTab === "dashboard" && !showMoodCheck && (
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                  </h1>
                  {selectedMood && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
                      <span className="text-2xl">{selectedMood.emoji}</span>
                      <span className="text-sm font-medium text-gray-600">
                        Feeling {selectedMood.label}
                      </span>
                      <button
                        onClick={() => setShowMoodCheck(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Voice Session
                        </h3>
                        <p className="text-sm text-gray-500">
                          Talk with AI assistant
                        </p>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium">
                      Start Voice Chat
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Text Chat
                        </h3>
                        <p className="text-sm text-gray-500">
                          Message AI assistant
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                    >
                      Start Text Chat
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          New message from AI Assistant
                        </p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Completed voice session with AI Wellness Coach
                        </p>
                        <p className="text-sm text-gray-500">
                          Yesterday at 2:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentiment Analysis */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Mood Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                      className={`rounded-lg p-4 ${
                        sentimentData.overallSentiment === "positive"
                          ? "bg-green-50"
                          : sentimentData.overallSentiment === "negative"
                          ? "bg-red-50"
                          : "bg-blue-50"
                      }`}
                    >
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Overall Sentiment
                      </h3>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {sentimentData.overallSentiment === "positive"
                            ? "😊"
                            : sentimentData.overallSentiment === "negative"
                            ? "😔"
                            : "😐"}
                        </span>
                        <span className="text-lg font-semibold capitalize">
                          {sentimentData.overallSentiment}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg p-4 bg-purple-50">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Recent Trend
                      </h3>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {sentimentData.recentTrend === "improving"
                            ? "📈"
                            : sentimentData.recentTrend === "declining"
                            ? "📉"
                            : "📊"}
                        </span>
                        <span className="text-lg font-semibold capitalize">
                          {sentimentData.recentTrend}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg p-4 bg-yellow-50">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Sentiment Score
                      </h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${
                              sentimentData.score > 0
                                ? "bg-green-600"
                                : sentimentData.score < 0
                                ? "bg-red-600"
                                : "bg-yellow-600"
                            }`}
                            style={{
                              width: `${Math.abs(sentimentData.score) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {sentimentData.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          {activeTab === "chat" && (
            <ChatContainer setSentimentData={setSentimentData} />
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

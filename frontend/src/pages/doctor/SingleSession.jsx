import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import Skeleton from "@mui/material/Skeleton";
import { selectUser } from "../../features/user/userSelector";
import { useSelector } from "react-redux";
import { LuArrowLeft, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { CiChat2 } from "react-icons/ci";
import { IoIosCall } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import UserSentimentSummary from "../../components/sentiment/user-summary";
import { Switch } from "@mui/material";

export default function SingleSession() {
  const { userId } = useParams();
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("call");
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState({});

  const [sentimentMode, setSentimentMode] = useState(false);
  const [sentimentSource, setSentimentSource] = useState("vader"); // "vader" or "llm"
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      axiosInstance.get(`/users/${userId}`)
        .then(res => {
          // If backend returns { data: user }, handle both {user} and {data: user}
          if (res.data && res.data.data) setUser(res.data.data);
          else setUser(res.data);
        })
        .catch(() => setUser({}));
    }
  }, [userId]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    sortBy: "created_at",
    sortOrder: "desc",
    limit: 10,
  });

  const highlightKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;

    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200">$1</mark>'
      );
    });

    return highlightedText;
  };

  const fetchSessions = async (page = 1, showPaginationLoader = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else if (showPaginationLoader) {
        setIsPaginationLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        type: activeTab === "chat" ? "chatbot" : "call",
      });

      const res = await axiosInstance.get(
        `/conversation/${userId || "default_user_id"}?${params}`
      );

      // console.log("Fetched sessions:", res.data);

      if (res.status === 200) {
        const { conversations, pagination: paginationData } = res.data;

        const filteredConversations =
          conversations?.filter((conv) => {
            const expectedType = activeTab === "chat" ? "chatbot" : "call";
            return conv.type === expectedType;
          }) || [];

        setChatSessions(filteredConversations);
        setPagination(
          paginationData || {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: filters.limit,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );

        if (
          page === 1 &&
          filteredConversations &&
          filteredConversations.length > 0
        ) {
          if (
            !selectedChat ||
            selectedChat.type !== (activeTab === "chat" ? "chatbot" : "call")
          ) {
            setSession(filteredConversations[0]);
            setSelectedChat(filteredConversations[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setSession(null);
      if (page === 1) {
        setChatSessions([]);
        setSelectedChat(null);
      }
    } finally {
      setIsLoading(false);
      setIsPaginationLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(1);
    fetchUser();
    // eslint-disable-next-line
  }, [filters, activeTab]);

  useEffect(() => {
    if (!selectedChat) return;
    // console.log("Selected chat:", selectedChat);
  }, [selectedChat]);

  const fetchChatAnalysis = async (sessionId) => {
    try {
      const res = await axiosInstance.get(`/conversation/session/${sessionId}`);

      if (res.status === 200) {
        const { analyzeData } = res.data;
        // console.log("Fetched chat analysis:", analyzeData);
        setSelectedChat({ ...selectedChat, ...analyzeData[0] });
      }
    } catch (err) {
      console.error("Error fetching chat analysis:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      setUser(res.data.user);
    } catch (e) {
      // console.log(e);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedChat(null);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSessions(newPage, true);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    fetchSessions(1);
  };

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({ ...prev, limit: newLimit }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "positive":
        return "text-green-600";
      case "neutral":
        return "text-orange-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "neutral":
        return "bg-orange-100 text-orange-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Sentiment word coloring logic from derick branch ---
  const getWordColor = (category) => {
    switch (category) {
      case "positive":
      case "very_positive":
        return "text-green-600 font-semibold";
      case "negative":
      case "very_negative":
        return "text-red-600 font-semibold";
      case "neutral":
        return "text-gray-800";
      default:
        return "text-gray-800";
    }
  };

  const renderMessageWithSentiment = (msg) => {
    let wordsArr = [];
    if (sentimentSource === "llm" && Array.isArray(msg.llmWordAnalysis) && msg.llmWordAnalysis.length > 0) {
      wordsArr = msg.llmWordAnalysis;
    } else if (Array.isArray(msg.sentimentWords) && msg.sentimentWords.length > 0) {
      wordsArr = msg.sentimentWords;
    }
    if (!wordsArr.length) return <span>{msg.message}</span>;
    const words = msg.message.split(/\s+/);
    return (
      <span>
        {words.map((word, idx) => {
          // For LLM, match by word and position for accuracy
          let found;
          if (sentimentSource === "llm") {
            found = wordsArr.find(
              (w) =>
                w.word &&
                w.word.toLowerCase() === word.toLowerCase() &&
                (w.position === undefined || w.position === idx)
            );
          } else {
            found = wordsArr.find(
              (w) => w.word && w.word.toLowerCase() === word.toLowerCase()
            );
          }
          if (found && found.sentiment && found.sentiment.category) {
            return (
              <span key={idx} className={getWordColor(found.sentiment.category)}>
                {word + " "}
              </span>
            );
          }
          return <span key={idx}>{word + " "}</span>;
        })}
      </span>
    );
  };
  // --- end sentiment logic ---

  const getPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getSessionIcon = (type) => {
    return type === "call" ? (
      <IoIosCall size={14} className="mr-1" />
    ) : (
      <CiChat2 size={14} className="mr-1" />
    );
  };

  const getSessionText = (type) => {
    return type === "call" ? "messages" : "messages";
  };

  return (
    <div className="p-4 mx-10 h-full ">
      <div className="flex items-center gap-5 border-red-500">
        <Link to="/doctor/users" className="cursor-pointer hover:text-blue-600">
          <LuArrowLeft size={20} />
        </Link>
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <h1 className="text-2xl font-bold">
            {user?.username
              ? user.username + "'s Conversations"
              : "User's Conversations"}
          </h1>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">Sentiment Mode</span>
          <Switch
            checked={sentimentMode}
            onChange={() => setSentimentMode((v) => !v)}
            color="primary"
          />
          {sentimentMode && (
            <div className="flex items-center gap-2 ml-2">
              <button
                className={`px-2 py-1 rounded text-xs font-medium ${sentimentSource === "vader" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setSentimentSource("vader")}
              >
                VADER
              </button>
              <button
                className={`px-2 py-1 rounded text-xs font-medium ${sentimentSource === "llm" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setSentimentSource("llm")}
              >
                LLM
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="flex gap-5">
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", width: "200px", marginTop: "10px" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "2rem", width: "200px", marginTop: "10px" }}
            />
          </div>
          <hr />
        </>
      ) : (
        <div className="w-full flex gap-5 mt-10 border-b">
          <div
            className={`flex gap-3 items-center mb-2 pb-2 cursor-pointer ${
              activeTab === "chat"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => handleTabChange("chat")}
          >
            <CiChat2 size={20} />
            <p className="text-lg">Chat History</p>
          </div>
          <div
            className={`flex gap-3 items-center mb-2 pb-2 cursor-pointer ${
              activeTab === "call"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => handleTabChange("call")}
          >
            <IoIosCall size={20} />
            <p className="text-lg">Call Recordings</p>
          </div>
          <div
            className={`flex gap-3 items-center mb-2 pb-2 cursor-pointer ${
              activeTab === "sentiment"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("sentiment")}
          >
            <TbReportAnalytics size={20} />
            <p className="text-lg">Patient Summary</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-4 gap-5 mt-5">
          <div className="col-span-1">
            <Skeleton variant="rectangular" width="100%" height={400} />
          </div>
          <div className="col-span-3">
            <Skeleton variant="rectangular" width="100%" height={400} />
          </div>
        </div>
      ) : (
        <>
          {activeTab === "sentiment" ? (
            <div className="mt-5">
              <UserSentimentSummary userId={userId} />
            </div>
          ) : (
        <div className="grid grid-cols-5 gap-5 mt-5 p-2 h-[550px]">
          <div className="col-span-2  h-full">
            <div className="relative bg-white border border-gray-200 rounded-lg max-h-[550px] shadow-sm flex flex-col">
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-sm text-gray-700">
                    Recent {activeTab === "chat" ? "Chat" : "Call"}{" "}
                    Conversations
                  </p>
                  <span className="text-xs text-gray-500">
                    {pagination.totalItems} total
                  </span>
                </div>

                <div className="flex gap-2 text-xs">
                  <select
                    value={filters.limit}
                    onChange={(e) =>
                      handleLimitChange(parseInt(e.target.value))
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>

                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split("-");
                      handleSortChange(sortBy, sortOrder);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="created_at-desc">Newest first</option>
                    <option value="created_at-asc">Oldest first</option>
                    <option value="type-asc">Type A-Z</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto relative">
                {isPaginationLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-sm text-gray-500">Loading...</div>
                  </div>
                )}

                {chatSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>
                      No {activeTab === "chat" ? "chat" : "call"} conversations
                      found
                    </p>
                  </div>
                ) : (
                  chatSessions.map((chatSession) => (
                    <div
                      key={chatSession.id}
                      className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedChat?.id === chatSession.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => setSelectedChat(chatSession)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm text-gray-900">
                          {chatSession.date}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            chatSession.session_analysis?.sentiment_category
                          )}`}
                        >
                          {chatSession.session_analysis?.sentiment_category
                            ? chatSession.session_analysis?.sentiment_category
                            : "Unknown"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {chatSession.session_analysis?.description
                          ? chatSession.session_analysis?.description
                          : "No description available"}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        {getSessionIcon(chatSession.type)}
                        <span>
                          {chatSession.messages}{" "}
                          {getSessionText(chatSession.type)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Showing {pagination.startIndex || 1} to{" "}
                      {pagination.endIndex || pagination.itemsPerPage} of{" "}
                      {pagination.totalItems}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPreviousPage}
                        className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <LuChevronLeft size={14} />
                      </button>

                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 py-1 text-xs rounded border ${
                            pageNum === pagination.currentPage
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage}
                        className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <LuChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[550px]">
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm text-gray-700">
                    {activeTab === "chat" ? "Chat" : "Call"} on{" "}
                    {selectedChat?.date || "Fri, May 24"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {selectedChat?.messages || 6}{" "}
                    {activeTab === "chat" ? "messages" : "messages"}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedChat?.conversation ? (
                  activeTab === "chat" ? (
                    selectedChat.conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">
                            {sentimentMode && msg.sender === "user"
                              ? renderMessageWithSentiment(msg)
                              : msg.message}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "user"
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-lg p-6">
                        <IoIosCall
                          size={48}
                          className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="font-medium text-gray-700 mb-2">
                          Call Recording
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Message Length: {selectedChat?.messages || 0} messages
                        </p>
                        <div className="bg-white rounded p-4 text-left">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">
                              Call Transcript:
                            </h4>
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              View Full Transcript
                            </button>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedChat.conversation.map((item, index) => (
                              <p key={index} className="text-sm">
                                <span className="font-medium">
                                  {item.sender}:
                                </span>{" "}
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: highlightKeywords(
                                      item.message,
                                      selectedChat.session_analysis?.keywords
                                    ),
                                  }}
                                />
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <p>Select a {activeTab} to view details</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IoTimeOutline size={16} />
                  <h4 className="font-medium text-sm text-gray-700">
                    {activeTab === "chat" ? "Chat" : "Call"} Analysis
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-xs text-gray-600 mb-2">
                      Topics Discussed
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedChat?.session_analysis?.keywords?.length > 0
                        ? selectedChat.session_analysis.keywords.map(
                            (topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {topic}
                              </span>
                            )
                          )
                        : "No topics discussed"}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-xs text-gray-600 mb-2">
                      Additional Notes
                    </h5>
                    <p className="text-xs text-gray-600">
                      No immediate follow-up required. Regular check-in schedule
                      can be maintained.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          )}
        </>
      )}

      {isModalOpen && selectedChat && activeTab === "call" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Full Call Transcript - {selectedChat.date}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedChat.conversation.map((item, index) => (
                <div key={index} className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-700">
                      {item.sender}
                    </span>
                    {item.time && (
                      <span className="text-xs text-gray-500">{item.time}</span>
                    )}
                  </div>
                  <p
                    className="text-sm text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(
                        item.message,
                        selectedChat.session_analysis?.keywords
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

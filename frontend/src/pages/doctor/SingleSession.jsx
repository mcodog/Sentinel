import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import Skeleton from "@mui/material/Skeleton";
import { selectUser } from "../../features/user/userSelector";
import { useSelector } from "react-redux";
import { LuArrowLeft } from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { CiChat2 } from "react-icons/ci";
import { IoIosCall } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";

export default function SingleSession() {
  const { userId } = useParams();
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("call");
  const [selectedChat, setSelectedChat] = useState(null);
  // const user = useSelector(selectUser);
  const [user, setUser] = useState({});

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(
        `/conversation/${userId || "default_user_id"}`
      );
      // console.log("Fetched sessions:", res.data);
      if (res.status === 200) {
        const { conversations } = res.data;

        setChatSessions(conversations || []);
        if (conversations && conversations.length > 0) {
          setSession(conversations[0]);
          setSelectedChat(conversations[0]);
          setIsLoading(false);
        } else {
          setSession(null);
        }
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setSession(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Positive":
        return "text-green-600";
      case "Moderate":
        return "text-orange-600";
      case "Negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Positive":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-orange-100 text-orange-800";
      case "Negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 mx-10">
      <div className="flex items-center gap-5">
        <Link to="/doctor/users" className="cursor-pointer hover:text-blue-600">
          <LuArrowLeft size={20} />
        </Link>
        {isLoading ? (
          <Skeleton variant="text" sx={{ fontSize: "2rem", width: "250px" }} />
        ) : (
          <h1 className="text-2xl font-bold">
            {user?.username
              ? user.username + "'s Conversations"
              : "john_doe's Conversations"}
          </h1>
        )}
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
            onClick={() => setActiveTab("chat")}
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
            onClick={() => setActiveTab("call")}
          >
            <IoIosCall size={20} />
            <p className="text-lg">Call Recordings</p>
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
        <div className="grid grid-cols-5 gap-5 mt-5">
          {/* Left Panel - Chat Sessions List */}
          <div className="col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-96 overflow-hidden">
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <p className="font-medium text-sm text-gray-700">
                  Recent Chat Conversations
                </p>
              </div>
              <div className="overflow-y-auto h-full">
                {chatSessions.map((chatSession) => (
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
                          chatSession.status
                        )}`}
                      >
                        {chatSession.status ? chatSession.status : "Unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {chatSession.description
                        ? chatSession.description
                        : "No description available"}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <CiChat2 size={14} className="mr-1" />
                      <span>{chatSession.messages} messages</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Chat Details */}
          <div className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-96 flex flex-col">
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm text-gray-700">
                    Chat on {selectedChat?.date || "Fri, May 24"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {selectedChat?.messages || 6} messages
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {selectedChat?.conversation ? (
                  selectedChat.conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
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
                  <div className="text-center text-gray-500 mt-8">
                    <p>Select a conversation to view messages</p>
                  </div>
                )}
              </div>

              {/* Analysis Section */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IoTimeOutline size={16} />
                  <h4 className="font-medium text-sm text-gray-700">
                    Conversation Analysis
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-xs text-gray-600 mb-2">
                      Topics Discussed
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        morning routine
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        anxiety
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        self-care
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        meditation
                      </span>
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
    </div>
  );
}

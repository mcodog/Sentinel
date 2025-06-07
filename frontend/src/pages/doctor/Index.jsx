/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import {
  LuUsers,
  LuMessageSquare,
  LuPhone,
  LuShield,
  LuHeart,
  LuTrendingUp,
} from "react-icons/lu";
import { CiWarning } from "react-icons/ci";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CiTimer } from "react-icons/ci";
import { backendActor } from "../../ic/actor";
import { useSelector } from "react-redux";
import { selectUserId } from "../../features/user/userSelector";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 1247,
    chatSessions: 89,
    callSessions: 23,
    severeCases: 12,
    normalCases: 156,
    mildCases: 78,
  });
  const userId = useSelector(selectUserId);

  const data = [
    { name: "Jan", mild: 4000, moderate: 2400, severe: 1200 },
    { name: "Feb", mild: 3000, moderate: 1398, severe: 800 },
    { name: "Mar", mild: 2000, moderate: 9800, severe: 3100 },
    { name: "Apr", mild: 2780, moderate: 3908, severe: 1600 },
    { name: "May", mild: 1890, moderate: 4800, severe: 2300 },
    { name: "June", mild: 2390, moderate: 3800, severe: 1900 },
  ];

  const sessions = [
    {
      id: 1,
      type: "chat",
      timestamp: "2 hours ago",
      summary:
        "Patient inquired about symptoms related to seasonal allergies and over-the-counter treatments.",
      duration: "15 min",
    },
    {
      id: 2,
      type: "call",
      timestamp: "5 hours ago",
      summary:
        "Consultation call regarding difficulties sleeping and potential lifestyle changes.",
      duration: "8 min",
    },
    {
      id: 3,
      type: "chat",
      timestamp: "1 day ago",
      summary:
        "Follow-up discussion about lab test results and recommended dietary adjustments.",
      duration: "12 min",
    },
    {
      id: 4,
      type: "call",
      timestamp: "2 days ago",
      summary:
        "Initial assessment for chronic back pain and review of physical therapy options.",
      duration: "25 min",
    },
    {
      id: 5,
      type: "chat",
      timestamp: "3 days ago",
      summary:
        "Patient feedback and suggestions on improving access to mental health support services.",
      duration: "18 min",
    },
  ];

  const getIcon = (type) => {
    return type === "chat" ? (
      <LuMessageSquare className="w-4 h-4 text-blue-500" />
    ) : (
      <LuPhone className="w-4 h-4 text-green-500" />
    );
  };

  const getTypeColor = (type) => {
    return type === "chat"
      ? "bg-blue-50 text-blue-700"
      : "bg-green-50 text-green-700";
  };

  useEffect(() => {
    const logActivity = async () => {
      try {
        await backendActor.addAuditLog({
          action: "viewed doctor dashboard",
          user_id: userId,
          details: [],
        });
      } catch (err) {
        console.error("Error logging activity:", err);
      }
    };

    logActivity();
  }, [userId]);

  return (
    <div className="flex flex-col px-10 py-5">
      {/* Widgets */}
      {isLoading ? (
        <div className="flex items-center justify-between mr-5">
          <Skeleton variant="rectangular" width={400} height={200} />
          <Skeleton variant="rectangular" width={400} height={200} />
          <Skeleton variant="rectangular" width={400} height={200} />
        </div>
      ) : (
        <div className="flex items-center justify-between mr-5 gap-10">
          {/* Users & Sessions Widget */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-200 flex-grow max-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-3 rounded-full shadow-md">
                  <LuUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    User Activity
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Total users & sessions
                  </p>
                </div>
              </div>
              <LuTrendingUp className="w-5 h-5 text-blue-400" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Total Users</span>
                <span className="text-2xl font-bold text-blue-900">
                  {stats.totalUsers.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuMessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 text-sm font-medium">
                      Chat
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-900">
                    {stats.chatSessions}
                  </span>
                  <p className="text-blue-600 text-xs">Active sessions</p>
                </div>

                <div className="bg-blue-200 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuPhone className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 text-sm font-medium">
                      Call
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-900">
                    {stats.callSessions}
                  </span>
                  <p className="text-blue-600 text-xs">Active calls</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-200 flex-grow max-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-3 rounded-full shadow-md">
                  <LuTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Daily Summary
                  </h3>
                  <p className="text-green-600 text-sm">Today's metrics</p>
                </div>
              </div>
              <LuUsers className="w-5 h-5 text-green-400" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.chatSessions + stats.callSessions}
                  </div>
                  <div className="text-green-600 text-sm">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.severeCases + stats.normalCases + stats.mildCases}
                  </div>
                  <div className="text-green-600 text-sm">Total Cases</div>
                </div>
              </div>

              <div className="bg-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-800 font-medium text-sm">
                    Session Distribution
                  </span>
                </div>
                <div className="w-full bg-green-300 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (stats.chatSessions /
                          (stats.chatSessions + stats.callSessions)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-green-700">
                  <span>
                    Chat:{" "}
                    {Math.round(
                      (stats.chatSessions /
                        (stats.chatSessions + stats.callSessions)) *
                        100
                    )}
                    %
                  </span>
                  <span>
                    Call:{" "}
                    {Math.round(
                      (stats.callSessions /
                        (stats.chatSessions + stats.callSessions)) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics Widget */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-purple-200 flex-grow max-h-[250px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-3 rounded-full shadow-md">
                  <LuTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Daily Summary
                  </h3>
                  <p className="text-purple-600 text-sm">Today's metrics</p>
                </div>
              </div>
              <LuUsers className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.chatSessions + stats.callSessions}
                  </div>
                  <div className="text-purple-600 text-sm">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.severeCases + stats.normalCases + stats.mildCases}
                  </div>
                  <div className="text-purple-600 text-sm">Total Cases</div>
                </div>
              </div>

              <div className="bg-purple-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-800 font-medium text-sm">
                    Session Distribution
                  </span>
                </div>
                <div className="w-full bg-purple-300 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (stats.chatSessions /
                          (stats.chatSessions + stats.callSessions)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-purple-700">
                  <span>
                    Chat:{" "}
                    {Math.round(
                      (stats.chatSessions /
                        (stats.chatSessions + stats.callSessions)) *
                        100
                    )}
                    %
                  </span>
                  <span>
                    Call:{" "}
                    {Math.round(
                      (stats.callSessions /
                        (stats.chatSessions + stats.callSessions)) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* */}

      {/* Content */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-between items-center gap-5">
            <Skeleton variant="rectangular" width="75%" height={250} />
            <Skeleton variant="rectangular" width="25%" height={250} />
          </div>
        ) : (
          <div className="flex gap-5">
            <div className="w-3/4 bg-white rounded-xl shadow-md py-4 px-6 flex flex-col">
              <h1 className="text-2xl font-semibold text-gray-800 text-center mb-2">
                Session Cases per Month
              </h1>

              <div className="flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line
                      type="monotone"
                      dataKey="mild"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      name="Mild Cases"
                    />
                    <Line
                      type="monotone"
                      dataKey="moderate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      name="Moderate Cases"
                    />
                    <Line
                      type="monotone"
                      dataKey="severe"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      name="Severe Cases"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-1/4 h-[350px] bg-white rounded-xl shadow-md p-4">
              <h2 className="font-bold text-lg mb-4">Severe Sessions</h2>

              <div className="space-y-3 overflow-y-auto h-[260px]">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(session.type)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            session.type
                          )}`}
                        >
                          {session.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CiTimer className="w-3 h-3" />
                        {session.duration}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {session.summary}
                    </p>

                    <div className="text-xs text-gray-500">
                      {session.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

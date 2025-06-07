import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuClipboard,
  LuGitGraph,
  LuUsers,
  LuHouse,
  LuTimer,
} from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import SidebarLink from "./SidebarLink";
import { Heart } from "@/components/Icons/Icons";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = {
    role: "doctor",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center">
        <div className="inline-block text-center p-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl text-start font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sentinel
              <div className="text-[8px] uppercase -mt-1">
                Your own medical liaison
              </div>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex-col flex-grow h-full flex justify-between">
        <div className="w-full">
          {user.role === "doctor" ? (
            <>
              <SidebarLink to="/doctor" Icon={LuHouse} text="Dashboard" />
              <SidebarLink to="/doctor/users" Icon={LuUsers} text="Patients" />

              <SidebarLink
                to="/doctor/sentiment-analysis"
                Icon={TbReportAnalytics}
                text="Sentiment Analytics"
              />
            </>
          ) : (
            <>
              <SidebarLink to="/admin" Icon={LuHouse} text="Dashboard" />
              <SidebarLink to="/admin/users" Icon={LuUsers} text="Patients" />
            </>
          )}

          {user.role !== "doctor" && (
            <>
              <SidebarLink Icon={LuGitGraph} text="Analytics" />
              <SidebarLink Icon={LuClipboard} text="Forms" />
            </>
          )}
        </div>
        <div className="w-full">
          {user.role !== "doctor" && (
            <Link to="/" className="flex items-center justify-center p-4">
              Go back to Client
            </Link>
          )}

          <Link to="/" className="flex items-center justify-center p-4">
            Go back to Client
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

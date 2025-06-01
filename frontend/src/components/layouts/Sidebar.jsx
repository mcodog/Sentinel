import React from "react";
import { Link } from "react-router-dom";
import {
  LuClipboard,
  LuGitGraph,
  LuUsers,
  LuHouse,
  LuTimer,
} from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import SidebarLink from "./SidebarLink";

const Sidebar = () => {
  const user = {
    role: "doctor",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center">
        <div className="inline-block text-center p-4">
          <div className="text-[30px] font-bold uppercase">Sentinel</div>
          <div className="text-[10px] uppercase -mt-1">
            Your own medical liaison
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
                to="/doctor/sessions"
                Icon={LuTimer}
                text="Sessions"
              />
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

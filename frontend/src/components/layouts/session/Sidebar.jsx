import React from "react";
import { Link } from "react-router-dom";
import {
  LuClipboard,
  LuGitGraph,
  LuUsers,
  LuHouse,
  LuTimer,
} from "react-icons/lu";
import SidebarLink from "../SidebarLink";

const Sidebar = () => {
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
          <div className=""></div>
        </div>
        <div className="w-full">
          <Link to="/" className="flex items-center justify-center p-4">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

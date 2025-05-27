import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const SideLayout = () => {
  return (
    <div className="flex w-screen h-screen">
      <div className="fixed z-40 w-50 custom-shadow h-full">
        <Sidebar />
      </div>
      <div className="ml-50 flex flex-col flex-grow">
        <div className="fixed z-50 h-25 w-full right-shadow bg-white">
          <div className="h-full flex items-center p-4">Dashboard</div>
        </div>
        <div className="mt-25 flex-grow overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SideLayout;

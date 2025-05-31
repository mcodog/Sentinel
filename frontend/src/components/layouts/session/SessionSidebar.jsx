import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function SessionSidebar() {
  return (
    <div className="flex w-screen h-screen">
      <div className="fixed z-40 w-50 custom-shadow h-full">
        <Sidebar />
      </div>
      <div className="ml-50 flex flex-col flex-grow">
        <div className="mt-10 flex-grow overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

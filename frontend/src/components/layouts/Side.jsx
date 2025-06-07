import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const SideLayout = () => {
  return (
    <div className="flex w-screen h-screen">
      <div className="fixed z-40 w-60 custom-shadow h-full">
        <Sidebar />
      </div>
      <div className="ml-60 flex flex-col flex-grow">
        <div className=" flex-grow overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SideLayout;

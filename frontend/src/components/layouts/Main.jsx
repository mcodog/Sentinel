import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Main = () => {
  return (
    <div>
      <div className="fixed z-50 top-0 left-0 h-26 w-full flex items-center justify-center header-shadow bg-white">
        <Header />
      </div>
      <div className="relative z-0 ">
        <Outlet />
      </div>
    </div>
  );
};

export default Main;

import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Main = () => {
  return (
    <div>
      <div className="fixed top-0 left-0 h-26 w-full flex items-center justify-center header-shadow">
        <Header />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Main;

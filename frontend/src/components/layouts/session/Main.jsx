import React from "react";
import { Outlet } from "react-router-dom";
import SessionSidebar from "./SessionSidebar";
export default function Main() {
  return (
    <div>
      <div>
        <SessionSidebar />
        <Outlet />
      </div>
    </div>
  );
}

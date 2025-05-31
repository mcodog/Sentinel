import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./components/layouts/Main";
import Welcome from "./pages/Welcome/Index";
import Login from "./pages/Login";
import Session from "./pages/Session";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Index";
import SideLayout from "./components/layouts/Side";
import SessionLayout from "./components/layouts/session/Main";
// Pages for doctors
import DoctorDashboard from "./pages/doctor/Index";
import DoctorUsers from "./pages/doctor/Users";
import DoctorSessions from "./pages/doctor/Sessions";
import DoctorSessionsOfUser from "./pages/doctor/SingleSession";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<Welcome />} />
      </Route>

      <Route path="session" element={<SessionLayout />}>
        <Route index element={<Session />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/session" element={<Session />} />
      <Route path="/admin" element={<SideLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/doctor" element={<SideLayout />}>
        <Route index element={<DoctorDashboard />}></Route>
        <Route path="users" element={<DoctorUsers />} />
        <Route path="sessions" element={<DoctorSessions />} />
        <Route path="user/:userId" element={<DoctorSessionsOfUser />} />
      </Route>
    </Routes>
  );
};

export default App;

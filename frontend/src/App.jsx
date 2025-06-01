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
import SentimentAnalyticsPage from "./pages/doctor/SentimentAnalytics";

// FOR PATIENTS
import PatientDashboard from "./pages/patients/Index";

import Call from "./pages/Welcome/Call";
import { AuthProvider } from "./context/AuthContext";
import { DoctorRoute, ProtectedRoute } from "./components/ProtectedRoutes";

import TestBlockchain from "./pages/Testblockchain.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/testblockchain" element={<TestBlockchain />} />
        <Route path="/" element={<Main />}>
          <Route index element={<Welcome />} />
          <Route path="/call" element={<Call />} />
        </Route>

        <Route path="session" element={<SessionLayout />}>
          <Route index element={<Session />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/session" element={<Session />} />

        <Route element={<DoctorRoute />}>
          <Route path="/admin" element={<SideLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/doctor" element={<SideLayout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="users" element={<DoctorUsers />} />
            <Route path="sessions" element={<DoctorSessions />} />
            <Route path="users/:userId" element={<DoctorSessionsOfUser />} />
          </Route>
        </Route>

        {/* PATIENT route without SideLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/patient" element={<PatientDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;

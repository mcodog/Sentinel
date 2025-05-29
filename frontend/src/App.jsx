import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./components/layouts/Main";
import Welcome from "./pages/Welcome/Index";
import Login from "./pages/Login";
import Session from "./pages/Session";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Index";
import SideLayout from "./components/layouts/Side";

// Pages for doctors
import DoctorDashboard from "./pages/doctor/Index";
import DoctorUsers from "./pages/doctor/Users";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<Welcome />} />
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
      </Route>
    </Routes>
  );
};

export default App;

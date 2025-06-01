import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RedirectIfAuth = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const DoctorRoute = () => {
  const { isDoctor } = useAuth();
  return isDoctor ? <Outlet /> : <Navigate to="/" replace />;
};

export const AdminRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

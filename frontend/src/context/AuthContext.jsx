import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/user/userSelector";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const user = useSelector(selectUser);

  const isAuthenticated = !!user.id;
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isDoctor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

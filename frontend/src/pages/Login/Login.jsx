import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/user/userSlice";
import { showLoginError, showUnverifiedError } from "@/utils/auth/alerts.js";
import { parseLoginError } from "@/utils/auth/parseLoginError.js";
import axios from "@/utils/axios";
import LoginCard from "./LoginCard";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/auth/login", formData);
      if (res.data.message === "Success") {
        const userData = {
          ...res.data.parsedUser,
          user_metadata: res.data.parsedUser.user_metadata || {
            full_name: res.data.parsedUser.email.split("@")[0],
          },
        };
        dispatch(setUser(userData));
        navigate(res.data.parsedUser.role === "user" ? "/patient" : "/doctor");
      }
    } catch (err) {
      const { type, message } = parseLoginError(err);
      console.log(type);
      if (type === "auth") return showLoginError(formData, message, navigate);
      if (type === "unverified") return showUnverifiedError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <LoginCard
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Login;

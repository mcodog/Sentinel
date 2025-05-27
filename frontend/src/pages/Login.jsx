import React, { useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import PrimeButton from "@/components/buttons/PrimeButton";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/utils/axios";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/user/userSlice";
import { selectUser } from "../features/user/userSelector";

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  // console.log(user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/auth/login", formData);
      if (res.data.message === "Success") {
        Swal.fire({
          title: "Successfully Verified!",
          text: "Redirecting you now...",
          icon: "success",
        });
        dispatch(setUser(res.data.parsedUser));
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
      // console.log(res.data.parsedUser);
    } catch (e) {
      if (e.response.data.message === "invalid_credentials") {
        Swal.fire({
          title: "Invalid Credentials",
          text: "Please check your email or password.",
          icon: "error",
        });
      } else if (e.response.data.message === "email_not_confirmed") {
        Swal.fire({
          title: "Account Unverified",
          text: "Please verify your account first.",
          icon: "error",
        });
      }
    }
  };

  const handleReturn = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className=" w-full h-screen">
      <div className=" h-full w-full flex items-center justify-center">
        <div className="relative z-10 w-lg h-[750px] bg-white rounded-4xl header-shadow flex flex-col items-center p-12">
          <div className="inline-block text-center">
            <div className="text-[50px] font-bold">Sentinel</div>
            <div className="text-[13px] uppercase -mt-2">
              Your own medical liaison
            </div>
          </div>
          <div className="flex flex-col flex-grow w-full justify-center items-center p-4">
            <TextInput
              maxWidth
              label="Email"
              name="email"
              value={formData.email}
              handleChange={handleChange}
            />
            <TextInput
              maxWidth
              password
              label="Password"
              name="password"
              value={formData.password}
              handleChange={handleChange}
            />
            <div className="m-4 w-full flex gap-2">
              <PrimeButton secondary label="Go Back" onClick={handleReturn} />
              <PrimeButton label="Login" onClick={handleSubmit} />
            </div>
            <div className="border-b w-full"></div>
            <div className="mt-2">
              Don't have an account? &nbsp;
              <Link to="/register" className="text-[#948979] font-bold">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-1/3 w-full absolute bottom-0 z-0 rounded-t-[250px] bg-[#222831]"></div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import PrimeButton from "@/components/buttons/PrimeButton";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/utils/axios";
import Swal from "sweetalert2";

const Register = () => {
  // const { doctorId } = useParams();
  const [formData, setFormData] = useState({
    doctorId: doctorId,
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const navigate = useNavigate();

  // useEffect(() => {
  //   checkIfDoctorExists();
  // }, [doctorId]);

  // const checkIfDoctorExists = () => {
  //   alert(doctorId);
  // };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/auth/register", formData);
      if (res.data.message === "Register successful") {
        Swal.fire({
          title: "Successfully Registered!",
          text: "Redirecting you to login page...",
          icon: "success",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (e) {
      if (e.response.data.error.startsWith("For security purposes")) {
        Swal.fire({
          title: "Request Timeout",
          text: e.response.data.error,
          icon: "error",
        });
      } else if (
        e.response.data.error ===
        'duplicate key value violates unique constraint "users_email_key"'
      ) {
        Swal.fire({
          title: "Email Already Exists",
          text: "Please login using the email you entered or enter a new email.",
          icon: "error",
        });
      }
    }
  };

  const handleReturn = () => {
    navigate("/login");
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
            <div className="w-full grid grid-cols-2 gap-2">
              <TextInput
                maxWidth
                label="First Name"
                name="firstname"
                value={formData.firstname}
                handleChange={handleChange}
              />
              <TextInput
                maxWidth
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                handleChange={handleChange}
              />
            </div>
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
              <PrimeButton secondary label="Sign In" onClick={handleReturn} />
              <PrimeButton label="Register" onClick={handleSubmit} />
            </div>
            {/* <div className="border-b w-full"></div>
            <div className="mt-2">
              Don't have an account? &nbsp;
              <span className="text-[#948979] font-bold">Sign Up</span>
            </div> */}
          </div>
        </div>
      </div>
      <div className="h-1/3 w-full absolute bottom-0 z-0 rounded-t-[250px] bg-[#222831]"></div>
    </div>
  );
};

export default Register;

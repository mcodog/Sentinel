import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { backendActor } from "../../ic/actor";
import axios from "@/utils/axios";
import Swal from "sweetalert2";

import RegisterCard from "./RegisterCard";

const Register = () => {
  const [formData, setFormData] = useState({
    // doctorId: doctorId,
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Function to calculate age from date of birth
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);

    // Check age requirement before proceeding
    if (formData.dob) {
      const age = calculateAge(formData.dob);
      if (age < 10) {
        Swal.fire({
          title: "Age Requirement Not Met",
          text: "You must be at least 10 years old to create an account.",
          icon: "warning",
          confirmButtonText: "I Understand",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await axios.post("/auth/register", formData);
      console.log("Registration Response:", res.data);
      if (res.data.message === "Register successful") {
        await backendActor.addConsentBlock({
          user_id: res.data.userId,
          consent_type: "PrivacyPolicy",
          consent_given: formData.agreeToTerms,
          consent_text_version: "I agree to the Privacy Policy",
          method: "checkbox",
        });

        await backendActor.addConsentBlock({
          user_id: res.data.userId,
          consent_type: "TermsOfService",
          consent_given: formData.agreeToTerms,
          consent_text_version: "I agree to the Terms of Service",
          method: "checkbox",
        });

        Swal.fire({
          title: "Successfully Registered!",
          text: "Please check your email and verify your account before logging in. Redirecting you to login page...",
          icon: "success",
          timer: 4000,
          timerProgressBar: true,
        });

        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
    } catch (e) {
      console.error("Registration Error:", e);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Register Section */}
      <RegisterCard
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default Register;

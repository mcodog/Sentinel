import React, { useState } from "react";
import HeroSection from "./Sections/HeroSection";
import AppFeatures from "./Sections/AppFeatures";
import SecuritySection from "./Sections/SecuritySection";
import CTASection from "./Sections/CTASection";
import Footer from "../../components/layouts/Footer";

const Index = () => {
  const [userType, setUserType] = useState("");

  const handleGetStarted = (type) => {
    setUserType(type);
    if (typeof Storage !== "undefined") {
      localStorage.setItem("userType", type);
    }

    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <HeroSection handleGetStarted={handleGetStarted} userType={userType} />
      {/* Features Section */}
      <AppFeatures />

      {/* Security & Trust Section */}
      <SecuritySection />

      {/* Call to Action Section */}
      <CTASection />
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

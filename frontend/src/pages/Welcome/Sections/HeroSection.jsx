import { Heart, Users, Lock } from "@/components/Icons/Icons";
import UserTypeCard from "@/components/card/UserTypeCard";
import ButtonLink from "@/components/buttons/ButtonLink";
import FeatureBadge from "@/components/badges/FeatureBadge";

const HeroSection = ({ handleGetStarted, userType }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="text-center">
        <div className="mb-8">
          <FeatureBadge
            icon={<Lock />}
            text="Blockchain-Secured Mental Health Platform"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          AI-Powered Mental Health
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Support & Analytics
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Experience the future of mental healthcare with our secure, AI-driven
          platform that combines intelligent conversation, sentiment analysis,
          and blockchain-verified audit trails for complete transparency and
          trust.
        </p>

        {/* User Type Selection */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          <UserTypeCard
            selected={userType === "patient"}
            onClick={() => handleGetStarted("patient")}
            icon={<Heart className="w-8 h-8 text-white" />}
            title="I'm a Patient"
            description="Start your mental health journey with AI-powered support"
            color="blue"
            selectedColor="blue"
            hoverColor="blue"
          />

          <UserTypeCard
            selected={userType === "doctor"}
            onClick={() => handleGetStarted("doctor")}
            icon={<Users color="white" className="w-8 h-8 text-white" />}
            title="I'm a Healthcare Provider"
            description="Access patient analytics and comprehensive dashboards"
            color="purple"
            selectedColor="purple"
            hoverColor="purple"
          />
        </div>

        {/* Login/Register Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center border-b-2 border-gray-400 pb-10">
          <ButtonLink to="/login" variant="primary">
            Login to Your Account
          </ButtonLink>
          <ButtonLink to="/register" variant="secondary">
            Create New Account
          </ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

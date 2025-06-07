// components/cards/LoginCard.jsx
import { ArrowRight, Lock } from "@/components/Icons/Icons";
import { Link } from "react-router-dom";
import FeatureBadge from "@/components/badges/FeatureBadge";
import PrimeTextInput from "@/components/inputs/PrimeTextInput";
import ButtonLink from "@/components/buttons/ButtonLink";

const LoginCard = ({ formData, handleChange, handleSubmit, isLoading }) => {
  return (
    <div className="w-lg bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-[1.02]">
      {/* Header */}
      <div className="text-center mb-8">
        <FeatureBadge icon={<Lock />} text="Secure Login Portal" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">
          Sign in to access your mental health dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <PrimeTextInput
          value={formData.email}
          label="Email"
          handleChange={handleChange}
          placeholder="Enter your email"
          isPassword={false}
          name="email"
        />
        <PrimeTextInput
          value={formData.password}
          label="Password"
          handleChange={handleChange}
          placeholder="Enter your password"
          isPassword={true}
          name="password"
        />

        <div className="text-right">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Signing In...
            </div>
          ) : (
            <div className="flex items-center">
              Sign In <ArrowRight />
            </div>
          )}
        </button>

        <ButtonLink to="/" variant="secondary" maxWidth>
          Go Back to Home
        </ButtonLink>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">New to Sentinel?</span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;

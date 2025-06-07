import { ArrowRight, UserPlus } from "@/components/Icons/Icons";
import FeatureBadge from "@/components/badges/FeatureBadge";
import PrimeTextInput from "@/components/inputs/PrimeTextInput";
import ButtonLink from "@/components/buttons/ButtonLink";
import { Link } from "react-router-dom";

const RegisterCard = ({ formData, handleSubmit, handleChange, isLoading }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center mb-8">
            <FeatureBadge icon={<UserPlus />} text="Create Your Account" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Sentinel
            </h1>
            <p className="text-gray-600">
              Start your journey to better mental health
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrimeTextInput
                value={formData.firstname}
                label="First Name"
                handleChange={handleChange}
                placeholder="Enter your first name"
                isPassword={false}
                name="firstname"
              />
              <PrimeTextInput
                value={formData.lastname}
                label="Last Name"
                handleChange={handleChange}
                placeholder="Enter your last name"
                isPassword={false}
                name="lastname"
              />
            </div>

            {/* Email Input */}
            <PrimeTextInput
              value={formData.email}
              label="Email"
              handleChange={handleChange}
              placeholder="Enter your email"
              isPassword={false}
              name="email"
            />

            {/* Password Input */}
            <PrimeTextInput
              value={formData.password}
              label="Password"
              handleChange={handleChange}
              placeholder="Enter your password"
              isPassword={true}
              name="password"
            />

            {/* Gender and DOB Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Terms of Agreement Checkbox */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center">
                  Create Account
                  <ArrowRight />
                </div>
              )}
            </button>

            {/* Go Back Button */}
            <ButtonLink to="/login" variant="secondary" maxWidth>
              Go Back to Log In
            </ButtonLink>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Ready to sign in?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Sign In Here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex justify-center p-10">
          <FeatureBadge
            icon={<UserPlus />}
            text="Your information is secured with industry-standard encryption"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterCard;

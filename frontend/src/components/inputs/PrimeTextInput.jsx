import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Assuming you use lucide-react

const PrimeTextInput = ({
  label,
  value,
  handleChange,
  placeholder,
  isPassword = false,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : "text";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={handleChange}
          required
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-gray-400 ${
            isPassword ? "pr-12" : ""
          }`}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </div>
  );
};

export default PrimeTextInput;

import React, { useState } from "react";

const TextInput = ({
  maxWidth,
  label,
  password,
  value,
  handleChange,
  name,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const shouldFloat = isFocused || value;
  const inputId = `input-${name}`;

  return (
    <div className={`relative ${maxWidth ? "w-full" : ""} mt-2`}>
      <label
        htmlFor={inputId}
        className={`absolute left-4 px-1 transition-all duration-200 bg-white  cursor-text
          ${shouldFloat ? "text-xs -top-2" : "text-sm top-4"}`}
      >
        {label}
      </label>

      <input
        id={inputId}
        type={password ? "password" : "text"}
        name={name}
        className="border p-2 pt-5 rounded-lg w-full focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default TextInput;

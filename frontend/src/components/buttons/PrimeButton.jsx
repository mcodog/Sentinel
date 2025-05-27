import React from "react";

const PrimeButton = ({ label, secondary, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 w-full cursor-pointer  ${
        secondary ? "text-black border" : "bg-[#222831] text-white"
      }`}
    >
      {label}
    </button>
  );
};

export default PrimeButton;

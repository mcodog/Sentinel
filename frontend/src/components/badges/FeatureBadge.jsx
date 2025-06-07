import React from "react";

const FeatureBadge = ({ icon, text, secondary = false }) => {
  const bgColor = secondary ? "bg-gray-100" : "bg-blue-100";
  const textColor = secondary ? "text-gray-500" : "text-blue-800";

  return (
    <div
      className={`inline-flex items-center px-4 py-2 ${bgColor} ${textColor} rounded-full text-sm font-medium mb-6`}
    >
      {icon}
      <span className="ml-2">{text}</span>
    </div>
  );
};

export default FeatureBadge;

import { IoIosCall } from "react-icons/io";
import { CiChat2 } from "react-icons/ci";

export const getStatusColor = (status) => {
  switch (status) {
    case "positive":
      return "text-green-600";
    case "neutral":
      return "text-orange-600";
    case "negative":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case "positive":
      return "bg-green-100 text-green-800";
    case "neutral":
      return "bg-orange-100 text-orange-800";
    case "negative":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// --- Sentiment word coloring logic from derick branch ---
export const getWordColor = (category) => {
  switch (category) {
    case "positive":
    case "very_positive":
      return "text-green-600 font-semibold";
    case "negative":
    case "very_negative":
      return "text-red-600 font-semibold";
    case "neutral":
      return "text-gray-800";
    default:
      return "text-gray-800";
  }
};

export const getSessionIcon = (type) => {
  return type === "call" ? (
    <IoIosCall size={14} className="mr-1" />
  ) : (
    <CiChat2 size={14} className="mr-1" />
  );
};

export const getSessionText = (type) => {
  return type === "call" ? "messages" : "messages";
};

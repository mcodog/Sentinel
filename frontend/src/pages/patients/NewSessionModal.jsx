import React, { useState } from "react";

const NewSessionModal = ({ isOpen, onClose, user }) => {
  const [sessionType, setSessionType] = useState("followup");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    setIsStarting(true);
    // Here you would integrate with your actual session starting logic
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsStarting(false);
    onClose();
    // In a real app, you would navigate to the session page
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Start New Session</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["initial", "followup", "urgent"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSessionType(type)}
                  className={`py-2 px-3 text-sm rounded ${
                    sessionType === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "initial"
                    ? "Initial"
                    : type === "followup"
                    ? "Follow-up"
                    : "Urgent"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              disabled={isStarting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting...
                </>
              ) : (
                "Start Session"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSessionModal;
import React from "react";

const ConsentModal = ({ isOpen, onConsent, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Consent for Recording</h2>
          <div className="prose prose-sm text-gray-600 mb-6">
            <p>
              To provide you with the best care, we would like to record this session. The recording will be:
            </p>
            <ul className="list-disc pl-5">
              <li>Used to generate accurate transcripts and summaries</li>
              <li>Securely stored and encrypted</li>
              <li>Accessible only to you and your healthcare providers</li>
              <li>Used to improve your future sessions</li>
            </ul>
            <p className="mt-4">
              You can withdraw consent at any time in your account settings.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onConsent(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Decline
            </button>
            <button
              onClick={() => onConsent(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
            >
              I Consent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
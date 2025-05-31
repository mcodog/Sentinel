import React from "react";
import { format } from "date-fns";

const SessionCard = ({ session, type }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {session.type === "initial" ? "Initial Consultation" : 
             session.type === "followup" ? "Follow-up Session" : "Urgent Session"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(session.scheduled_time), "MMMM d, yyyy h:mm a")}
          </p>
          {type === "past" && session.summary && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {session.summary}
            </p>
          )}
        </div>
        <div>
          {type === "upcoming" ? (
            <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200">
              Join
            </button>
          ) : (
            <button className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200">
              View Details
            </button>
          )}
        </div>
      </div>
      {type === "past" && session.sentiment && (
        <div className="mt-3 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sentiment:</span>
          <span
            className={`text-sm font-medium ${
              session.sentiment === "positive"
                ? "text-green-600"
                : session.sentiment === "negative"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {session.sentiment.charAt(0).toUpperCase() + session.sentiment.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
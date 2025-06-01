import React from "react";

export default function ChatMessageList({ conversation }) {
  return (
    <div style={{ padding: 16 }}>
      {conversation.map((msg, idx) => (
        <div key={idx} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", color: msg.sender === "user" ? "#1976d2" : "#43a047" }}>
            {msg.sender === "user" ? "You" : "AI Assistant"}
          </div>
          <div>{msg.message}</div>
          <div style={{ fontSize: 11, color: "#888" }}>{msg.time}</div>
          {msg.sentiment && (
            <div style={{ fontSize: 11, color: "#bdbdbd" }}>
              Sentiment: {msg.sentiment.sentiment_category || msg.sentiment.overall?.category}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import React from "react";

export default function ChatSessionList({ sessions, selectedId, onSelect }) {
  return (
    <div>
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelect(session)}
          style={{
            background: session.id === selectedId ? "#e0e0e0" : "#fff",
            cursor: "pointer",
            padding: "12px",
            borderBottom: "1px solid #eee",
          }}
        >
          <div>
            <b>
              {session.type === "chatbot"
                ? "AI Assistant"
                : "Doctor-Patient"}
            </b>
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {session.date}
          </div>
          <div style={{ fontSize: 12 }}>
            {session.messages} messages
          </div>
        </div>
      ))}
    </div>
  );
}

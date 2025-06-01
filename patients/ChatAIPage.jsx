import React, { useEffect, useState, useCallback } from "react";
import ChatSessionList from "./components/ChatSessionList";
import ChatMessageList from "./components/ChatMessageList";
import ChatInputBox from "./components/ChatInputBox";
import { format, parseISO } from "date-fns";

const API = "/api/chatbot";

function normalizeDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = parseISO(dateStr);
    return format(d, "EEE, MMM d");
  } catch {
    return dateStr;
  }
}

export default function ChatAIPage({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`${API}/conversation/${userId}`);
    const data = await res.json();
    if (data.conversations) {
      setSessions(
        data.conversations
          .filter(s => s.type === "chatbot")
          .map(s => ({
            ...s,
            date: normalizeDate(s.date),
          }))
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = session => {
    setSelectedSession(session);
  };

  const handleSend = async message => {
    if (!selectedSession) return;
    setLoading(true);
    const res = await fetch(`${API}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userMessage: message,
        sessionId: selectedSession.id,
        isAnonymous: false,
      }),
    });
    const data = await res.json();
    await fetchSessions();
    if (data.success) {
      const updated = await fetch(`${API}/conversation/${userId}`);
      const d = await updated.json();
      const found = d.conversations.find(s => s.id === selectedSession.id);
      setSelectedSession({
        ...found,
        date: normalizeDate(found.date),
      });
    }
    setLoading(false);
  };

  const handleNewSession = async () => {
    setLoading(true);
    const res = await fetch(`${API}/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success && data.session) {
      await fetchSessions();
      setSelectedSession({
        ...data.session,
        date: normalizeDate(data.session.date),
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 320, borderRight: "1px solid #eee", overflowY: "auto" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <button onClick={handleNewSession} disabled={loading}>
            + New AI Chat
          </button>
        </div>
        <ChatSessionList
          sessions={sessions}
          selectedId={selectedSession?.id}
          onSelect={handleSelectSession}
        />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedSession ? (
          <>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <ChatMessageList conversation={selectedSession.conversation} />
            </div>
            <ChatInputBox onSend={handleSend} disabled={loading} />
          </>
        ) : (
          <div style={{ padding: 32, color: "#888" }}>
            Select a chat session or start a new one.
          </div>
        )}
      </div>
    </div>
  );
}

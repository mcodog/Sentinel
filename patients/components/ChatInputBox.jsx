import React, { useState } from "react";

export default function ChatInputBox({ onSend, disabled }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (value.trim()) {
          onSend(value);
          setValue("");
        }
      }}
      style={{ display: "flex", padding: 16, borderTop: "1px solid #eee" }}
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Type your message..."
        style={{ flex: 1, marginRight: 8, padding: 8 }}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
}

import React, { useState } from "react";
import { backendActor } from "../ic/actor";

const Testblockchain = () => {
  const [status, setStatus] = useState("");

  const exampleMetadata = {
    summary: "Sample block from React",
    sentimentScore: 0.7,
    sentimentCategory: "positive",
    tags: ["react", "ic", "blockchain"],
  };

  async function addBlock() {
    try {
      setStatus("Adding block...");
      await backendActor.addBlock(exampleMetadata);
      setStatus("Block added successfully!");
    } catch (err) {
      console.error("Error adding block:", err);
      setStatus("Failed to add block");
    }
  }

  return (
    <div className="relative mt-26 h-full w-full border">
      <button
        onClick={addBlock}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Block
      </button>
      <p>{status}</p>
    </div>
  );
};

export default Testblockchain;

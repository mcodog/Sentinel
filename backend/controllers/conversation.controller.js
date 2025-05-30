export const generateResponse = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const responses = [
      "That's interesting! Tell me more.",
      "I'm not sure I understand. Could you rephrase that?",
      "Absolutely! Let's dive into that.",
      "Hmm... let me think about it.",
      "Great question! Here's what I think.",
      "Thanks for sharing that!",
      "Let's explore that further together.",
      "That's a fascinating point of view.",
      "You're making me think!",
      "Could you give me an example?",
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    res.json({ response });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

import dotenv from "dotenv";
import axios from "axios";
import ChatAssistant from "../services/chatbot.service.js";

// Load environment variables
dotenv.config();

// For HTTP testing with the Hugging Face API
const testWithAPI = async () => {
  try {
    console.log("Testing Hugging Face API connection...");

    const HF_API_URL =
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct";
    const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

    if (!HF_API_TOKEN) {
      console.error("Error: HUGGING_FACE_API_TOKEN is not set in .env file");
      return;
    }

    console.log("Sending test request to Hugging Face API...");

    const response = await axios.post(
      HF_API_URL,
      {
        inputs: "Hello, I'm feeling a bit anxious today. Can you help me?",
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Response received:", response.data);
    console.log("API test completed successfully!");
  } catch (error) {
    console.error("API test failed:", error.response?.data || error.message);
  }
};

// For testing with local ChatAssistant
const testWithLocalModel = async () => {
  try {
    console.log("Testing local ChatAssistant implementation...");

    // Create a new instance of ChatAssistant
    const chatAssistant = await ChatAssistant.create();
    console.log("ChatAssistant created successfully");

    // Test message
    const messages = [
      { role: "system", content: "You are a helpful mental health assistant." },
      {
        role: "user",
        content: "I've been feeling stressed lately. What can I do?",
      },
    ];

    console.log("Generating response...");
    const response = await chatAssistant.generateResponse(messages);

    console.log("Response from model:", response);
    console.log("Local model test completed successfully!");
  } catch (error) {
    console.error("Local model test failed:", error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log("==== CHAT SERVICE TESTS ====");

  // Test with API
  // await testWithAPI();

  console.log("\n");

  // Test with local model
  await testWithLocalModel();

  console.log("==== ALL TESTS COMPLETED ====");
};

runTests();

import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HUGGING_FACE_API_TOKEN);

export const generateResponse = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const chatCompletion = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. You're Jason, a medical assistant. You are here to help with medical queries and provide information based on the user's input. Do not provide any personal medical advice or diagnoses. Be brief and to the point. Don't exceed more than 3 sentences in your response. Speak in Tagalog, and you do not need to translate you're response to English. Conversation Rules: 1. Always be polite and respectful. 2. Do not provide personal medical advice or diagnoses. 3. Keep responses brief and to the point, ideally no more than 3 sentences. 4. Always shorten your sentences to be concise and clear. 5. Speak in Tagalog, no need to translate your response to English. 6. Use Everyday words and phrases that are easy to understand. 7. Avoid using complex medical jargon or technical terms unless necessary. 8. Throw in some emotion. 9. Use a friendly and approachable tone and always use an active voice.",
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const response = chatCompletion.choices[0].message;
    res.json({ response: response.content });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

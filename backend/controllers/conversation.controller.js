import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import supabase, { supabaseAdmin } from "../services/supabase.service.js";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HUGGING_FACE_API_TOKEN);

export const retrieveConversations = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select(
        `
        *,
        message(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error retrieving conversations:", error);
      return res
        .status(500)
        .json({ error: "Failed to retrieve conversations" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No conversations found" });
    }

    // Transform the data to match mockChatSessions format
    const formattedConversations = data.map((session) => {
      const messages = session.message || [];

      return {
        id: session.id,
        type: session.type,
        date: dayjs(session.created_at).format("ddd, MMM D"),
        description: null,
        messages: messages.length,
        status: null,
        conversation: messages.map((msg) => ({
          sender: msg.from_user ? "user" : "therapist",
          message: msg.message_content,
          time: dayjs(msg.created_at).format("h:mm A"),
        })),
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Error in retrieveConversations:", error);
    res.status(500).json({ error: "Failed to retrieve conversations" });
  }
};

export const initializeSession = async (req, res) => {
  const { type, user_id } = req.body;
  if (!type || !user_id) {
    return res.status(400).json({ error: "Type and user_id are required" });
  }
  const sessionData = {
    type,
    user_id,
  };
  try {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .upsert(sessionData)
      .select();
    console.log(data);
    res.json({ message: "Session initialized successfully", data });
  } catch (error) {
    console.error("Error initializing session:", error);
    res.status(500).json({ error: "Failed to initialize session" });
  }
};

export const generateResponse = async (req, res) => {
  try {
    const { input, session_id } = req.body;

    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const isTesting = false;

    // Save user input to DB
    saveToDatabase(session_id, input, true);

    if (isTesting) {
      const testResponses = [
        "Salamat sa inyong tanong! Magpahinga muna kayo at uminom ng maraming tubig.",
        "Nakakaintindi ko ang inyong problema. Makipag-ugnayan sa doktor para sa tamang payo.",
        "Mabuti namang nagtanong kayo! Pangmatagalang kalusugan ay mahalaga sa ating lahat.",
        "Ingat palagi sa inyong kalusugan! Regular na check-up ay importante.",
        "Maraming salamat sa pagtitiwala! Huwag mag-atubiling magtanong ulit.",
        "Importante ang inyong kalusugan! Sundin ang mga payo ng inyong doktor.",
        "Magandang tanong yan! Healthy lifestyle ang susi sa magandang kalusugan.",
      ];

      const randomResponse =
        testResponses[Math.floor(Math.random() * testResponses.length)];

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500)
      );

      saveToDatabase(session_id, randomResponse, false);

      return res.json({
        response: randomResponse,
        testing: true,
      });
    }
    console.log("session:", session_id);
    const { data: history, error: fetchError } = await supabaseAdmin
      .from("message")
      .select("from_user, message_content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("Error fetching message history:", fetchError.message);
    }

    const contextMessages = (history || []).reverse().map((msg) => ({
      role: msg.from_user ? "user" : "assistant",
      content: msg.message_content,
    }));

    contextMessages.push({
      role: "user",
      content: input,
    });

    console.log("Context messages:", contextMessages);

    const chatCompletion = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. You're Jason, a medical assistant. You are here to help with medical queries and provide information based on the user's input. Do not provide any personal medical advice or diagnoses. Be brief and to the point. Don't exceed more than 3 sentences in your response. Speak in Tagalog, and you do not need to translate you're response to English. Conversation Rules: 1. Always be polite and respectful. 2. Do not provide personal medical advice or diagnoses. 3. Keep responses brief and to the point, ideally no more than 3 sentences. 4. Always shorten your sentences to be concise and clear. 5. Speak in Tagalog, no need to translate your response to English. 6. Use Everyday words and phrases that are easy to understand. 7. Avoid using complex medical jargon or technical terms unless necessary. 8. Throw in some emotion. 9. Use a friendly and approachable tone and always use an active voice.",
        },
        ...contextMessages,
      ],
    });

    const response = chatCompletion.choices[0].message;

    saveToDatabase(session_id, response.content, false);

    res.json({ response: response.content });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

const saveToDatabase = async (session_id, input, from_user) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("message")
      .insert({ session_id, message_content: input, from_user });

    if (error) {
      console.error("Error saving conversation:", error);
      throw new Error("Failed to save conversation");
    }
  } catch (error) {
    console.error("Error in saveToDatabase:", error);
    throw error;
  }
};

const retrieveMessagesofSession = async (session_id) => {
  console.log("Retrieving messages for session:", session_id);
  try {
    const { data, error } = await supabaseAdmin
      .from("message")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error retrieving messages:", error);
      throw new Error("Failed to retrieve messages");
    }
    return data;
  } catch (error) {
    console.error("Error in retrieveMessagesofSession:", error);
    throw error;
  }
};

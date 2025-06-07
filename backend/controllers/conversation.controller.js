import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import supabase, { supabaseAdmin } from "../services/supabase.service.js";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPT = `You are Sentinel, a compassionate and professional mental health therapy chatbot. Your purpose is to provide emotional support, active listening, and therapeutic guidance to users who may be struggling with mental health challenges.
Please shorten response. As much as possible in the first few lines of the conversation (EXTREMELY IMPORTANT)
Core Guidelines:
- Always maintain a warm, empathetic, and non-judgmental tone
- Practice active listening by acknowledging and validating user emotions
- Ask thoughtful follow-up questions to encourage deeper reflection
- Provide coping strategies and therapeutic techniques when appropriate
- Recognize when issues are beyond your scope and suggest professional help
- Never provide medical diagnoses or prescribe medications
- Maintain strict confidentiality and create a safe space for users
- Use evidence-based therapeutic approaches (CBT, mindfulness, etc.)
- Be patient and allow users to express themselves at their own pace
- Use Leading Questions.
- Don't overexplain.
- Be brief and straight to the point

Boundaries:
- You are NOT a replacement for professional therapy or medical care
- You cannot diagnose mental health conditions
- You cannot prescribe medications
- If a user expresses suicidal thoughts or immediate danger, encourage them to seek immediate professional help
- Stay focused on mental health and emotional well-being topics
- Politely redirect conversations that are unrelated to mental health

Response Style:
- Keep responses conversational and accessible
- Use "I" statements to show empathy ("I understand how difficult this must be")
- Offer practical coping strategies and techniques
- Encourage self-reflection and personal growth
- Validate emotions while promoting healthy thinking patterns
- Talk less, listen more. Use leading questions and make the user comfortable to speak without saying too much.

Remember: You are here to listen, support, and guide users toward better mental health and emotional well-being.`;

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HUGGING_FACE_API_TOKEN);

export const retrieveConversations = async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (pageNum < 1) {
    return res.status(400).json({ error: "Page must be greater than 0" });
  }

  if (limitNum < 1 || limitNum > 100) {
    return res.status(400).json({ error: "Limit must be between 1 and 100" });
  }

  // Calculate offset
  const offset = (pageNum - 1) * limitNum;

  try {
    // Get total count first
    const { count, error: countError } = await supabaseAdmin
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting conversations:", countError);
      return res.status(500).json({ error: "Failed to count conversations" });
    }

    // Validate sort parameters
    const validSortFields = ["created_at", "updated_at", "type"];
    const validSortOrders = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortDirection = validSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase() === "asc"
      : false; // false = descending

    // Get paginated data
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select(
        `
        *,
        message(*),
        session_analysis(*),
        users(*)
      `
      )
      .eq("user_id", userId)
      .order(sortField, { ascending: sortDirection })
      .range(offset, offset + limitNum - 1);

    console.log(data);

    if (error) {
      console.error("Error retrieving conversations:", error);
      return res
        .status(500)
        .json({ error: "Failed to retrieve conversations" });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        conversations: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: count || 0,
          itemsPerPage: limitNum,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    }

    // Transform the data to match mockChatSessions format
    const formattedConversations = data.map((session) => {
      const messages = session.message || [];
      const conversation = messages.map((msg) => {
        let sentimentWords = [];
        let sentimentAnalysis = null;
        let llmWordAnalysis = null;

        if (
          Array.isArray(msg.sentiment_analysis) &&
          msg.sentiment_analysis.length > 0 &&
          msg.sentiment_analysis[0].analysis_data
        ) {
          const analysisData = msg.sentiment_analysis[0].analysis_data;
          sentimentAnalysis = analysisData;

          if (
            analysisData.wordAnalysis &&
            Array.isArray(analysisData.wordAnalysis.mostEmotionalWords)
          ) {
            sentimentWords = analysisData.wordAnalysis.mostEmotionalWords;
          }

          if (
            analysisData.llmWordAnalysis &&
            Array.isArray(analysisData.llmWordAnalysis.wordAnalysis)
          ) {
            llmWordAnalysis = analysisData.llmWordAnalysis.wordAnalysis;
          }
        }

        return {
          sender: msg.from_user ? "user" : "therapist",
          message: msg.message_content,
          time: dayjs(msg.created_at).format("h:mm A"),
          sentimentWords,
          sentimentAnalysis,
          llmWordAnalysis,
        };
      });

      return {
        id: session.id,
        type: session.type,
        date: dayjs(session.created_at).format("ddd, MMM D"),
        description: null,
        messages: messages.length,
        status: null,
        conversation,
        session_analysis: session.session_analysis
          ? {
              summary: session.session_analysis.summary || null,
              description: session.session_analysis.description || null,
              sentiment_score: session.session_analysis.sentiment_score || null,
              intensity_score: session.session_analysis.intensity_score || null,
              sentiment_category:
                session.session_analysis.sentiment_category || null,
              keywords: session.session_analysis.keywords || [],
            }
          : {
              summary: null,
              description: null,
              sentiment_score: null,
              intensity_score: null,
              sentiment_category: null,
              keywords: [],
            },
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    console.log("Formatted conversations:", formattedConversations);

    res.json({
      conversations: formattedConversations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPreviousPage,
        startIndex: offset + 1,
        endIndex: Math.min(offset + limitNum, count),
      },
    });
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
    return res.json({ message: "Session initialized successfully", data });
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
          content: PROMPT,
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

export const retrieveMessagesofSession = async (req, res) => {
  const { sessionId } = req.params;
  console.log("Retrieving messages for session:", sessionId);
  try {
    const { data, error } = await supabaseAdmin
      .from("message")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const dialogue = data
      .map((msg) => {
        const speaker = msg.from_user ? "User" : "AI";
        return `${speaker}: ${msg.message_content}`;
      })
      .join("\n");

    const analyzedData = await analyzeConversation(dialogue);
    if (analyzedData.error) {
      console.error("Error analyzing conversation:", analyzedData.error);
      return res.status(500).json({ error: "Failed to analyze conversation" });
    }

    if (error) {
      console.error("Error retrieving messages:", error);
      throw new Error("Failed to retrieve messages");
    }

    const { data: analyzeData, error: analyzeError } = await supabaseAdmin
      .from("session_analysis")
      .upsert({ ...analyzedData, id: sessionId })
      .select();

    if (analyzeError) throw new Error("Failed to save analysis data");

    return res.status(200).json({ analyzeData });
  } catch (error) {
    console.error("Error in retrieveMessagesofSession:", error);
    throw error;
  }
};

const analyzeConversation = async (conversation) => {
  const chatCompletion = await client.chatCompletion({
    provider: "fireworks-ai",
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      {
        role: "system",
        content: `
You are a helpful assistant. Your task is to analyze a conversation between a user and an AI and return structured data. Remember that you are preparing data for a psychologist/doctor to look at so be sure to create a helpful and easy to ready data that doctor's can take a look at and quickly gain an understanding of the patient's status. Remember to always focus on what the user says (Not the AI)

Structured Data Guide:
- Summary - Summarize the Patient's Concerns and Main Problems.
- sentiment_category - Analyze what the User says (not the AI) and identify what their status is (positive, neutral, negative)

Respond ONLY in the following JSON format:

{
  "summary": "Brief summary of the overall conversation.",
  "description": "Slightly more detailed narrative of what happened.",
  "sentiment_score": 0.75, // Float from 0.0 (negative) to 1.0 (positive)
  "intensity_score": 0.45, // Float from 0.0 (calm) to 1.0 (very intense)
  "sentiment_category": "neutral", // Must be one of: "positive", "neutral", or "negative" 
  "keywords": ["problem1", "concern2", "symptom3"] // Focus ONLY on user-raised issues or concerns
}

DO NOT include any extra commentary. The JSON must be properly formatted.
      `.trim(),
      },
      {
        role: "user",
        content: `Analyze the following conversation and provide a summary, description, sentiment score, intensity score, sentiment category, and keywords (from user's concerns only):\n\n${conversation}`,
      },
    ],
  });

  // Try to parse structured JSON response
  try {
    const parsed = JSON.parse(chatCompletion.choices[0].message.content);
    return parsed;
  } catch (error) {
    console.error("Failed to parse structured response:", error);
    return {
      summary: null,
      description: null,
      sentiment_score: null,
      intensity_score: null,
      sentiment_category: null,
      keywords: [],
      error: "Invalid JSON format from model",
    };
  }
};

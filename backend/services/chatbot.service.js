import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { supabaseAdmin } from "./supabase.service.js";
import sentimentService from "./sentiment.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HF_CHATBOT_TOKEN);

// Feature toggle for anonymous chat - set to 'true' to enable, 'false' to disable
const ALLOW_ANONYMOUS_CHAT = process.env.ALLOW_ANONYMOUS_CHAT === "true";

// In-memory storage for anonymous user conversations
const anonymousChats = new Map();

const PROMPT = `You are Sentinel, a compassionate and professional mental health therapy chatbot. Your purpose is to provide emotional support, active listening, and therapeutic guidance to users who may be struggling with mental health challenges.

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

Remember: You are here to listen, support, and guide users toward better mental health and emotional well-being.`;

const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

class ChatbotService {
  /**
   * Generate a session ID for anonymous users
   */
  static generateAnonymousSessionId() {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if anonymous chat is enabled
   */
  static isAnonymousChatEnabled() {
    return ALLOW_ANONYMOUS_CHAT;
  }

  /**
   * Save message to memory for anonymous users
   */
  static saveAnonymousMessage(
    sessionId,
    messageContent,
    fromUser,
    sentiment = null
  ) {
    if (!anonymousChats.has(sessionId)) {
      anonymousChats.set(sessionId, {
        messages: [],
        createdAt: new Date().toISOString(),
      });
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: messageContent,
      isUser: fromUser,
      timestamp: new Date().toISOString(),
      sentiment: sentiment,
    };

    anonymousChats.get(sessionId).messages.push(message);
    return { success: true, data: message };
  }

  /**
   * Get conversation history for anonymous users
   */
  static getAnonymousConversationHistory(sessionId, limit = 20) {
    if (!anonymousChats.has(sessionId)) {
      return { success: true, conversation: [], messageCount: 0 };
    }

    const sessionData = anonymousChats.get(sessionId);
    const limitedMessages = sessionData.messages.slice(-limit);

    return {
      success: true,
      conversation: limitedMessages,
      messageCount: limitedMessages.length,
    };
  }

  /**
   * Clear anonymous conversation
   */
  static clearAnonymousConversation(sessionId) {
    if (anonymousChats.has(sessionId)) {
      anonymousChats.delete(sessionId);
      return {
        success: true,
        message: "Anonymous conversation cleared successfully",
      };
    }
    return {
      success: true,
      message: "No anonymous conversation found to clear",
    };
  }

  /**
   * Get or create a chatbot session for the user
   * Uses the existing sessions table with type='chatbot'
   */
  static async getOrCreateChatbotSession(userId, sessionId = null) {
    try {
      if (sessionId) {
        // Try to get existing session
        const { data: existingSession, error } = await supabaseAdmin
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("user_id", userId)
          .eq("type", "chatbot")
          .single();

        if (!error && existingSession) {
          return { success: true, session: existingSession };
        }
      }

      // Create new chatbot session
      const { data: newSession, error: createError } = await supabaseAdmin
        .from("sessions")
        .insert({
          user_id: userId,
          type: "chatbot",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating chatbot session:", createError);
        return { success: false, error: createError.message };
      }

      return { success: true, session: newSession };
    } catch (error) {
      console.error("Error in getOrCreateChatbotSession:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save message to the message table following the conversation pattern
   */
  static async saveMessage(sessionId, messageContent, fromUser) {
    try {
      const { data, error } = await supabaseAdmin
        .from("message")
        .insert({
          session_id: sessionId,
          message_content: messageContent,
          from_user: fromUser,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error in saveMessage:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save sentiment analysis to the sentiment_analysis table
   */
  static async saveSentimentAnalysis(messageId, sentimentData) {
    try {
      console.log("=== SENTIMENT ANALYSIS SAVE ATTEMPT ===");
      console.log("Message ID:", messageId);
      console.log("Sentiment Data received:", sentimentData ? "YES" : "NO");

      if (!sentimentData) {
        console.log("❌ No sentiment data provided - skipping save");
        return { success: true }; // Skip if no sentiment data
      }

      console.log("📊 Sentiment Data Structure:");
      console.log("- Overall category:", sentimentData.overall?.category);
      console.log("- Overall compound score:", sentimentData.overall?.compound);
      console.log("- Overall intensity:", sentimentData.overall?.intensity);
      console.log(
        "- Translation wasTranslated:",
        sentimentData.translation?.wasTranslated
      );
      console.log(
        "- Translation originalLanguage:",
        sentimentData.translation?.originalLanguage
      );
      console.log("- Full sentiment object keys:", Object.keys(sentimentData));
      console.log(
        "- Full sentiment object:",
        JSON.stringify(sentimentData, null, 2)
      );

      const insertData = {
        message_id: messageId,
        sentiment_category: sentimentData.overall?.category || "neutral",
        sentiment_score: sentimentData.overall?.compound || 0,
        intensity: sentimentData.overall?.intensity || 0,
        was_translated: sentimentData.translation?.wasTranslated || false,
        original_language: sentimentData.translation?.originalLanguage || "en",
        analysis_data: sentimentData || {},
      };

      console.log("💾 Data to insert:", insertData);

      const { data, error } = await supabaseAdmin
        .from("sentiment_analysis")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("❌ Database error saving sentiment analysis:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return { success: false, error: error.message };
      }

      console.log("✅ Sentiment analysis saved successfully!");
      console.log("Saved data:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Exception in saveSentimentAnalysis:", error);
      console.error("Stack trace:", error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get conversation history for a chatbot session (supports both authenticated and anonymous)
   */
  static async getConversationHistory(
    userId = null,
    sessionId = null,
    limit = 20,
    isAnonymous = false
  ) {
    try {
      // Handle anonymous users
      if (isAnonymous) {
        if (!sessionId) {
          return { success: true, conversations: [], messageCount: 0 };
        }
        return this.getAnonymousConversationHistory(sessionId, limit);
      }

      // Handle authenticated users (existing database logic)
      if (!userId) {
        return {
          success: false,
          error: "User ID is required for authenticated users",
          conversations: [],
        };
      }

      let query = supabaseAdmin
        .from("sessions")
        .select(
          `
                    id,
                    created_at,
                    type,
                    message (
                        id,
                        message_content,
                        from_user,
                        created_at,
                        sentiment_analysis (
                            sentiment_category,
                            sentiment_score
                        )
                    )
                `
        )
        .eq("user_id", userId)
        .eq("type", "chatbot")
        .order("created_at", { ascending: false });

      if (sessionId) {
        query = query.eq("id", sessionId);
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error("Error fetching conversation history:", error);
        return { success: false, error: error.message, conversations: [] };
      }

      if (!sessions || sessions.length === 0) {
        return { success: true, conversations: [], messageCount: 0 };
      }

      // Transform sessions to include formatted conversation data
      const formattedSessions = sessions.map(session => {
        const messages = session.message || [];

        return {
          id: session.id,
          type: session.type,
          date: new Date(session.created_at).toISOString(),
          description: null,
          messages: messages.length,
          status: null,
          conversation: messages.map(msg => ({
            id: msg.id,
            sender: msg.from_user ? "user" : "ai",
            message: msg.message_content,
            time: new Date(msg.created_at).toISOString(),
            sentiment: msg.sentiment_analysis?.[0] || null
          }))
        };
      });

      return {
        success: true,
        conversations: formattedSessions,
        messageCount: formattedSessions.reduce((count, session) => count + session.messages, 0),
      };
    } catch (error) {
      console.error("Error getting conversation history:", error);
      return { success: false, error: error.message, conversations: [] };
    }
  }

  /**
   * Generate response using the organization's database structure
   * Supports both authenticated users (database) and anonymous users (memory)
   */
  static async generateResponse(
    userId,
    userMessage,
    sessionId = null,
    isAnonymous = false,
    llmOptions = {
      enableLLM: true,
      enableLLMWordAnalysis: true,
      enableTranslation: true
    }
  ) {
    try {
      // Validate input
      if (
        !userMessage ||
        typeof userMessage !== "string" ||
        userMessage.trim().length === 0
      ) {
        throw new Error("Invalid message provided");
      }

      const trimmedMessage = userMessage.trim();
      let activeSessionId = sessionId;

      // Handle anonymous users if feature is enabled
      if (isAnonymous) {
        if (!this.isAnonymousChatEnabled()) {
          throw new Error("Anonymous chat feature is disabled");
        }

        // Generate session ID for anonymous user if not provided
        if (!activeSessionId) {
          activeSessionId = this.generateAnonymousSessionId();
        }

        // Analyze sentiment of user message with enhanced LLM analysis
        let sentimentAnalysis = null;
        try {
          sentimentAnalysis = await sentimentService.analyzeSentimentComplete(
            trimmedMessage,
            llmOptions
          );
        } catch (sentimentError) {
          console.warn(
            "Enhanced sentiment analysis failed for anonymous user:",
            sentimentError.message
          );
        }

        // Save user message to memory
        this.saveAnonymousMessage(
          activeSessionId,
          trimmedMessage,
          true,
          sentimentAnalysis
        );

        // Check for crisis content
        const validation = this.validateMessage(trimmedMessage);
        if (validation.needsImmediateAttention) {
          const crisisResponse = this.getCrisisResponse();
          this.saveAnonymousMessage(activeSessionId, crisisResponse, false);

          return {
            success: true,
            response: crisisResponse,
            sessionId: activeSessionId,
            sentiment: sentimentAnalysis,
            isCrisisResponse: true,
            isAnonymous: true,
          };
        }

        // Get recent conversation history for context
        const historyResult = this.getAnonymousConversationHistory(
          activeSessionId,
          10
        );
        const recentMessages = historyResult.success
          ? historyResult.conversation
          : [];

        // Build conversation context for AI model
        const conversation = [];
        recentMessages.slice(-20).forEach((msg) => {
          // Last 10 exchanges (20 messages)
          if (msg.isUser) {
            conversation.push({ role: "user", content: msg.message });
          } else {
            conversation.push({ role: "assistant", content: msg.message });
          }
        });

        // Add current user message
        conversation.push({ role: "user", content: trimmedMessage });

        // Prepare messages for the AI model
        const messages = [{ role: "system", content: PROMPT }, ...conversation];

        // Generate response using HuggingFace Inference API
        let response;
        let botResponse;

        try {
          response = await client.chatCompletion({
            model: MODEL,
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
          });

          botResponse = response?.choices?.[0]?.message?.content?.trim();

          if (!botResponse) {
            throw new Error("No response generated from AI model");
          }
        } catch (aiError) {
          console.error("Error generating AI response for anonymous user:", aiError);
          // Use fallback response for AI generation errors
          botResponse = "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment. If you're experiencing a mental health emergency, please contact a crisis helpline or emergency services immediately.";
        }

        // Save bot response to memory
        this.saveAnonymousMessage(activeSessionId, botResponse, false);

        return {
          success: true,
          response: botResponse,
          sessionId: activeSessionId,
          sentiment: sentimentAnalysis,
          conversationLength: conversation.length,
          isAnonymous: true,
        };
      }

      // Handle authenticated users (existing database logic)
      if (!userId) {
        throw new Error("User ID is required for authenticated users");
      }

      // Get or create chatbot session
      const sessionResult = await this.getOrCreateChatbotSession(
        userId,
        sessionId
      );
      if (!sessionResult.success) {
        throw new Error(`Failed to get/create session: ${sessionResult.error}`);
      }

      const session = sessionResult.session;
      activeSessionId = session.id;

      // Analyze sentiment of user message with enhanced LLM analysis
      let sentimentAnalysis = null;
      try {
        sentimentAnalysis = await sentimentService.analyzeSentimentComplete(
          trimmedMessage,
          llmOptions
        );
      } catch (sentimentError) {
        console.warn("Enhanced sentiment analysis failed:", sentimentError.message);
      }

      // Save user message to database
      const userMessageResult = await this.saveMessage(
        activeSessionId,
        trimmedMessage,
        true
      );
      if (!userMessageResult.success) {
        console.warn("Failed to save user message:", userMessageResult.error);
      }

      // Save sentiment analysis if available
      if (userMessageResult.success && sentimentAnalysis) {
        try {
          await this.saveSentimentAnalysis(
            userMessageResult.data.id,
            sentimentAnalysis
          );
        } catch (sentimentError) {
          console.warn("Failed to save sentiment analysis:", sentimentError.message);
        }
      }

      // Check for crisis content
      const validation = this.validateMessage(trimmedMessage);
      if (validation.needsImmediateAttention) {
        const crisisResponse = this.getCrisisResponse();

        // Save crisis response to database
        await this.saveMessage(activeSessionId, crisisResponse, false);

        return {
          success: true,
          response: crisisResponse,
          sessionId: activeSessionId,
          sentiment: sentimentAnalysis,
          isCrisisResponse: true,
          isAnonymous: false,
        };
      }

      // Get recent conversation history for context
      const historyResult = await this.getConversationHistory(
        userId,
        activeSessionId,
        10
      );

      let recentMessages = [];
      if (historyResult.success && historyResult.conversations && historyResult.conversations.length > 0) {
        // Find the specific session and get its conversation messages
        const currentSession = historyResult.conversations.find(session => session.id === activeSessionId);
        if (currentSession && currentSession.conversation && Array.isArray(currentSession.conversation)) {
          recentMessages = currentSession.conversation;
        }
      }

      // Build conversation context for AI model
      const conversation = [];
      if (Array.isArray(recentMessages)) {
        recentMessages.slice(-20).forEach((msg) => {
        // Last 10 exchanges (20 messages)
          if (msg.sender === 'user') {
            conversation.push({ role: "user", content: msg.message });
          } else if (msg.sender === 'ai') {
            conversation.push({ role: "assistant", content: msg.message });
          }
        });
      }

      // Add current user message
      conversation.push({ role: "user", content: trimmedMessage });

      // Prepare messages for the AI model
      const messages = [{ role: "system", content: PROMPT }, ...conversation];

      // Generate response using HuggingFace Inference API
      let response;
      let botResponse;

      try {
        response = await client.chatCompletion({
          model: MODEL,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        });

        botResponse = response?.choices?.[0]?.message?.content?.trim();

        if (!botResponse) {
          throw new Error("No response generated from AI model");
        }
      } catch (aiError) {
        console.error("Error generating AI response:", aiError);
        // Use fallback response for AI generation errors
        botResponse = "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment. If you're experiencing a mental health emergency, please contact a crisis helpline or emergency services immediately.";
      }

      // Save bot response to database
      const botMessageResult = await this.saveMessage(
        activeSessionId,
        botResponse,
        false
      );
      if (!botMessageResult.success) {
        console.warn("Failed to save bot message:", botMessageResult.error);
      }

      return {
        success: true,
        response: botResponse,
        sessionId: activeSessionId,
        sentiment: sentimentAnalysis,
        conversationLength: conversation.length,
        isAnonymous: false,
      };
    } catch (error) {
      console.error("Error generating chatbot response:", error);

      // Return a fallback response for service errors
      const fallbackResponse =
        "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment. If you're experiencing a mental health emergency, please contact a crisis helpline or emergency services immediately.";

      return {
        success: false,
        response: fallbackResponse,
        error: error.message,
      };
    }
  }

  /**
   * Clear conversation history for a user (supports both authenticated and anonymous)
   */
  static async clearConversation(
    userId = null,
    sessionId = null,
    isAnonymous = false
  ) {
    try {
      // Handle anonymous users
      if (isAnonymous) {
        if (sessionId) {
          return this.clearAnonymousConversation(sessionId);
        } else {
          // Clear all anonymous conversations (not recommended in production)
          anonymousChats.clear();
          return {
            success: true,
            message: "All anonymous conversations cleared successfully",
          };
        }
      }

      // Handle authenticated users (existing database logic)
      if (!userId) {
        return {
          success: false,
          error: "User ID is required for authenticated users",
        };
      }

      let sessionQuery = supabaseAdmin
        .from("sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "chatbot");

      if (sessionId) {
        sessionQuery = sessionQuery.eq("id", sessionId);
      }

      const { data: sessions, error: sessionError } = await sessionQuery;

      if (sessionError) {
        console.error("Error fetching chatbot sessions:", sessionError);
        return { success: false, error: sessionError.message };
      }

      if (!sessions || sessions.length === 0) {
        return { success: true, message: "No chatbot sessions found to clear" };
      }

      // Delete messages from chatbot sessions
      const sessionIds = sessions.map((s) => s.id);
      const { error: deleteError } = await supabaseAdmin
        .from("message")
        .delete()
        .in("session_id", sessionIds);

      if (deleteError) {
        console.error("Error clearing messages:", deleteError);
        return { success: false, error: deleteError.message };
      }

      return {
        success: true,
        message: "Chatbot conversation history cleared successfully",
      };
    } catch (error) {
      console.error("Error clearing conversation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize a new chat session
   */
  static async initializeSession(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
        };
      }

      const { data, error } = await supabaseAdmin
        .from("sessions")
        .insert({
          user_id: userId,
          type: "chatbot",
        })
        .select()
        .single();

      if (error) {
        console.error("Error initializing session:", error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        session: {
          id: data.id,
          type: data.type,
          date: new Date(data.created_at).toISOString(),
          description: null,
          messages: 0,
          conversation: []
        }
      };
    } catch (error) {
      console.error("Error in initializeSession:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a specific chat session
   */
  static async deleteSession(userId, sessionId) {
    try {
      if (!userId || !sessionId) {
        return {
          success: false,
          error: "User ID and Session ID are required",
        };
      }

      // First delete all messages associated with the session
      const { error: messagesError } = await supabaseAdmin
        .from("message")
        .delete()
        .eq("session_id", sessionId);

      if (messagesError) {
        console.error("Error deleting session messages:", messagesError);
        return { success: false, error: messagesError.message };
      }

      // Then delete the session itself
      const { error: sessionError } = await supabaseAdmin
        .from("sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (sessionError) {
        console.error("Error deleting session:", sessionError);
        return { success: false, error: sessionError.message };
      }

      return {
        success: true,
        message: "Session deleted successfully",
      };
    } catch (error) {
      console.error("Error in deleteSession:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate message for crisis content
   */
  static validateMessage(message) {
    const harmfulPatterns = [
      /self.?harm/i,
      /suicide/i,
      /kill.?(myself|me)/i,
      /end.?my.?life/i,
      /hurt.?(myself|me)/i,
      /want.?to.?die/i,
      /not.?worth.?living/i,
    ];

    const containsHarmfulContent = harmfulPatterns.some((pattern) =>
      pattern.test(message)
    );

    return {
      isValid: true,
      containsRiskFactors: containsHarmfulContent,
      needsImmediateAttention: containsHarmfulContent,
    };
  }

  /**
   * Get crisis response message
   */
  static getCrisisResponse() {
    return `I'm deeply concerned about what you've shared, and your safety and well-being are my top priorities.

Please consider reaching out to a mental health professional or crisis helpline immediately:

• National Center for Mental Health Crisis Hotline (Philippines): 1553 (Luzon-wide, toll-free), 0917-899-8727, or 0908-639-2672
• HOPELINE Philippines: (02) 8804-4673, 0917-558-4673, or 2919 (toll-free for Globe/TM subscribers)
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
• Find Help: https://findahelpline.com/countries/ph/topics/suicidal-thoughts

You are not alone, and there are people ready to support you through this challenging time.

If you're in immediate danger, please call emergency services (911 in the Philippines) or go to the nearest emergency room.

Would you like to share more about what's been going on? I'm here to listen.
`;
  }
}

export default ChatbotService;

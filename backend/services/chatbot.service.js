import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HUGGING_FACE_API_TOKEN);

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
const PROVIDER = "nscale";

// Store conversation history in memory (in production, use a database)
const conversationStore = new Map();

class ChatbotService {
    static async generateResponse(userId, userMessage) {
    try {
        // Validate input
        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
            throw new Error('Invalid message provided');
        }

        // Get or create conversation history for user
        let conversation = conversationStore.get(userId) || [];

        // Add user message to conversation
        conversation.push({ role: 'user', content: userMessage.trim() });

        // Prepare messages for the AI model
        const messages = [
            { role: 'system', content: PROMPT },
            ...conversation.slice(-10) // Keep last 10 exchanges to manage context length
        ];

        // Generate response using HuggingFace Inference API
        const response = await client.chatCompletion({
            model: MODEL,
            messages: messages,
            max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      });

            const botResponse = response.choices[0]?.message?.content?.trim();

            if (!botResponse) {
                throw new Error('No response generated from AI model');
            }

            // Add bot response to conversation
            conversation.push({ role: 'assistant', content: botResponse });

            // Update conversation store
            conversationStore.set(userId, conversation);

            return {
                success: true,
                response: botResponse,
                conversationLength: conversation.length
            };

        } catch (error) {
            console.error('Error generating chatbot response:', error);

            // Return a fallback response for service errors
            return {
                success: false,
                response: "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment. If you're experiencing a mental health emergency, please contact a crisis helpline or emergency services immediately.",
                error: error.message
            };
        }
    }

    static getConversationHistory(userId) {
        try {
            const conversation = conversationStore.get(userId) || [];
            return {
                success: true,
                conversation: conversation,
                messageCount: conversation.length
            };
    } catch (error) {
        console.error('Error retrieving conversation history:', error);
        return {
            success: false,
            conversation: [],
            error: error.message
        };
    }
  }

    static clearConversation(userId) {
    try {
        conversationStore.delete(userId);
        return {
            success: true,
            message: 'Conversation history cleared successfully'
        };
    } catch (error) {
            console.error('Error clearing conversation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static validateMessage(message) {
        // Check for potentially harmful content
        const harmfulPatterns = [
            /self.?harm/i,
            /suicide/i,
            /kill.?(myself|me)/i,
            /end.?my.?life/i,
            /hurt.?(myself|me)/i
        ];

        const containsHarmfulContent = harmfulPatterns.some(pattern =>
            pattern.test(message)
        );

        return {
            isValid: true, // We still want to respond to these messages therapeutically
            containsRiskFactors: containsHarmfulContent,
            needsImmediateAttention: containsHarmfulContent
        };
    }

    static getCrisisResponse() {
        return `I'm very concerned about what you've shared with me. Your safety and wellbeing are the most important things right now. 

Please consider reaching out to a mental health professional or crisis helpline immediately:

• National Suicide Prevention Lifeline: 988 (US)
• Crisis Text Line: Text HOME to 741741
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

You don't have to go through this alone. There are people who want to help and support you through this difficult time.

If you're in immediate danger, please call emergency services (911 in the US) or go to your nearest emergency room.

Would you like to talk about what's been leading to these feelings?`;
  }
}

export default ChatbotService;

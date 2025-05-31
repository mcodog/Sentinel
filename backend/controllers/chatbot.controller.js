import ChatbotService from '../services/chatbot.service.js';

class ChatbotController {
    // Send a message to the chatbot and get a response
    static async sendResponse(req, res) {
        try {
            const { message, userId } = req.body;

            // Validate required fields
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            // Validate message content
            const validation = ChatbotService.validateMessage(message);

            // If message contains risk factors, prioritize crisis response
            if (validation.needsImmediateAttention) {
                const crisisResponse = ChatbotService.getCrisisResponse();
                return res.status(200).json({
                    success: true,
                    response: crisisResponse,
                    isCrisisResponse: true,
                    timestamp: new Date().toISOString()
                });
            }

            // Generate chatbot response
            const result = await ChatbotService.generateResponse(userId, message);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    response: result.response,
                    conversationLength: result.conversationLength,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to generate response',
                    fallbackResponse: result.response
                });
            }

        } catch (error) {
            console.error('Error in sendResponse:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                fallbackResponse: "I'm sorry, I'm experiencing technical difficulties. Please try again later. If you're in crisis, please contact emergency services or a mental health helpline."
            });
        }
    }

    // Get conversation history for a user
    static async getResponse(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const result = ChatbotService.getConversationHistory(userId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    conversation: result.conversation,
                    messageCount: result.messageCount,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve conversation history'
                });
            }

        } catch (error) {
            console.error('Error in getResponse:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Clear conversation history for a user
    static async clearChat(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const result = ChatbotService.clearConversation(userId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to clear conversation history'
                });
            }

        } catch (error) {
            console.error('Error in clearChat:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Health check endpoint for the chatbot service
    static async healthCheck(req, res) {
        try {
            return res.status(200).json({
                success: true,
                message: 'Chatbot service is running',
                service: 'Sentinel Mental Health Chatbot',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in healthCheck:', error);
            return res.status(500).json({
                success: false,
                error: 'Service health check failed'
            });
        }
    }
}

export default ChatbotController;


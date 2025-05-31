import ChatbotService from '../services/chatbot.service.js';

class ChatbotController {
    // Send a message to the chatbot and get a response
    static async sendResponse(req, res) {
        try {
            const { message, userId, sessionId, isAnonymous = false } = req.body;

            // Validate required fields
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            // Check if anonymous chat is enabled when trying to use anonymous mode
            if (isAnonymous && !ChatbotService.isAnonymousChatEnabled()) {
                return res.status(403).json({
                    success: false,
                    error: 'Anonymous chat feature is disabled',
                    fallbackResponse: "Anonymous chat is currently disabled. Please create an account to access the mental health chatbot."
                });
            }

            // Validate user ID for authenticated users
            if (!isAnonymous && !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required for authenticated users'
                });
            }

            // Generate chatbot response with sentiment analysis and storage (database or memory)
            const result = await ChatbotService.generateResponse(userId, message, sessionId, isAnonymous);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    response: result.response,
                    sessionId: result.sessionId,
                    sentiment: result.sentiment,
                    isCrisisResponse: result.isCrisisResponse || false,
                    isAnonymous: result.isAnonymous || false,
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
            const { sessionId, limit = 20, isAnonymous = 'false' } = req.query;

            const isAnon = isAnonymous === 'true';

            // Validate user ID for authenticated users
            if (!isAnon && !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required for authenticated users'
                });
            }

            // Check if anonymous chat is enabled when trying to use anonymous mode
            if (isAnon && !ChatbotService.isAnonymousChatEnabled()) {
                return res.status(403).json({
                    success: false,
                    error: 'Anonymous chat feature is disabled'
                });
            }

            const result = await ChatbotService.getConversationHistory(userId, sessionId, parseInt(limit), isAnon);

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
            const { sessionId, isAnonymous = 'false' } = req.query;

            const isAnon = isAnonymous === 'true';

            // Validate user ID for authenticated users
            if (!isAnon && !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required for authenticated users'
                });
            }

            // Check if anonymous chat is enabled when trying to use anonymous mode
            if (isAnon && !ChatbotService.isAnonymousChatEnabled()) {
                return res.status(403).json({
                    success: false,
                    error: 'Anonymous chat feature is disabled'
                });
            }

            const result = await ChatbotService.clearConversation(userId, sessionId, isAnon);

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
                anonymousChatEnabled: ChatbotService.isAnonymousChatEnabled(),
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

    // Check if anonymous chat feature is enabled
    static async checkAnonymousFeature(req, res) {
        try {
            return res.status(200).json({
                success: true,
                anonymousChatEnabled: ChatbotService.isAnonymousChatEnabled(),
                message: ChatbotService.isAnonymousChatEnabled()
                    ? 'Anonymous chat is enabled'
                    : 'Anonymous chat is disabled',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error checking anonymous feature:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to check anonymous feature status'
            });
        }
    }
}

export default ChatbotController;


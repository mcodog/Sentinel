import axiosInstance from './axios';

const chatService = {
    // Get conversation history from the backend (now returns sessions)
    async getConversations(userId) {
        try {
            const response = await axiosInstance.get(`/chatbot/conversation/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    },

    // Initialize a new chat session
    async initializeSession(userId, isAnonymous = false) {
        try {
            const response = await axiosInstance.post('/chatbot/initialize', {
                userId,
                isAnonymous
            });
            return response.data;
        } catch (error) {
            console.error('Error initializing session:', error);
            throw error;
        }
    },

    // Delete a specific session
    async deleteSession(userId, sessionId) {
        try {
            const response = await axiosInstance.delete(`/chatbot/session/${userId}/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    },

    // Send a message to the chatbot
    async sendMessage(message, userId, sessionId = null, isAnonymous = false) {
        try {
            const response = await axiosInstance.post('/chatbot/send', {
                message,
                userId,
                sessionId,
                isAnonymous
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Clear chat history (all sessions for user)
    async clearChat(userId, sessionId = null, isAnonymous = false) {
        try {
            if (isAnonymous && sessionId) {
                return await axiosInstance.delete(`/chatbot/clear/${userId}?sessionId=${sessionId}&isAnonymous=true`);
            } else {
                return await axiosInstance.delete(`/chatbot/clear/${userId}${sessionId ? `?sessionId=${sessionId}` : ''}`);
            }
        } catch (error) {
            console.error('Error clearing chat history:', error);
            throw error;
        }
    },

    // Check if anonymous chat is enabled
    async checkAnonymousFeature() {
        try {
            const response = await axiosInstance.get('/chatbot/anonymous-status');
            return response.data;
        } catch (error) {
            console.error('Error checking anonymous feature:', error);
            return { anonymousChatEnabled: false };
        }
    }
};

export default chatService;

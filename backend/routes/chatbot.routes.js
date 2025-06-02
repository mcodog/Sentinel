import express from 'express';
import ChatbotController from '../controllers/chatbot.controller.js';

const router = express.Router();

// POST /api/chatbot/send - Send a message to the chatbot and get a response
router.post('/send', ChatbotController.sendResponse);

// GET /api/chatbot/conversation/:userId - Get conversation history for a user
router.get('/conversation/:userId', ChatbotController.getResponse);

// POST /api/chatbot/initialize - Create new chat session
router.post('/initialize', ChatbotController.initializeSession);

// DELETE /api/chatbot/session/:userId/:sessionId - Delete specific session
router.delete('/session/:userId/:sessionId', ChatbotController.deleteSession);

// DELETE /api/chatbot/clear/:userId - Clear conversation history for a user
router.delete('/clear/:userId', ChatbotController.clearChat);

// GET /api/chatbot/health - Health check for the chatbot service
router.get('/health', ChatbotController.healthCheck);

// GET /api/chatbot/anonymous-status - Check if anonymous chat is enabled
router.get('/anonymous-status', ChatbotController.checkAnonymousFeature);

export default router;
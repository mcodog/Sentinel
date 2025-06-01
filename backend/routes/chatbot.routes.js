import express from 'express';
import ChatbotController from '../controllers/chatbot.controller.js';

const router = express.Router();

// POST /api/chatbot/send - Send a message to the chatbot and get a response
router.post('/send', ChatbotController.sendResponse);

// GET /api/chatbot/conversation/:userId - Get conversation history for a user
router.get('/conversation/:userId', ChatbotController.getResponse);

// DELETE /api/chatbot/clear/:userId - Clear conversation history for a user
router.delete('/clear/:userId', ChatbotController.clearChat);

// GET /api/chatbot/health - Health check for the chatbot service
router.get('/health', ChatbotController.healthCheck);

export default router;
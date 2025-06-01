import express from "express";
import {
  generateResponse,
  initializeSession,
  retrieveConversations,
  retrieveMessagesofSession,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/initialize", initializeSession);
router.post("/", generateResponse);
router.get("/:userId", retrieveConversations);
router.get("/session/:sessionId", retrieveMessagesofSession);

export default router;

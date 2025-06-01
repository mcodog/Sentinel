import express from "express";
import {
  generateResponse,
  initializeSession,
  retrieveConversations,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/initialize", initializeSession);
router.post("/", generateResponse);

router.get("/:userId", retrieveConversations);

export default router;

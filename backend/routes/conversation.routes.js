import express from "express";
import { generateResponse } from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", generateResponse);

export default router;

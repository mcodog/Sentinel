import express from "express";
import {
  getSessions_Doctor,
  getSessions_user,
} from "../controllers/session.controller.js";

const router = express.Router();

// Get all sessions for a doctor
router.get("/doctor/:doctorId", getSessions_Doctor);

// Get all sessions for a user
router.get("/user/:userId", getSessions_user);

export default router;

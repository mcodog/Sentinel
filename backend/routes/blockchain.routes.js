import express from "express";
import {
  encryptGeneric,
  decryptGeneric,
} from "../controllers/blockchain.controller.js";

const router = express.Router();

// Generic Encrypt and Decrypt Routes
router.post("/encrypt/:type", encryptGeneric);
router.post("/decrypt/:type", decryptGeneric);

export default router;

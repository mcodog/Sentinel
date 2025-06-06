import CryptoJS from "crypto-js";
import { supabaseAdmin } from "../services/supabase.service.js";

const secretKey = process.env.ENCRYPTION_SECRET_KEY;

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Generic Encrypt Controller
export const encryptGeneric = async (req, res) => {
  try {
    const type = req.params.type;
    const payload = req.body;

    console.log(`Encrypting ${type}:`, payload);

    const encrypted = encryptData(payload);
    res.json({ encrypted });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({ error: "Encryption failed." });
  }
};

// Generic Decrypt Controller
export const decryptGeneric = async (req, res) => {
  try {
    const type = req.params.type;
    const { encrypted } = req.body;

    const decrypted = decryptData(encrypted.data);
    console.log(decrypted);
    res.json({ decrypted });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({ error: "Decryption failed." });
  }
};

// Get user info for all activity
export const getUsersInfo = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid ids array" });
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("id", ids);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ error: "Failed to fetch user info." });
  }
};

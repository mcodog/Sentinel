import axios from "./axios";

export const encryptData = async (data, type) => {
  console.log("Encrypting data:", data);

  if (!data) {
    throw new Error("No data provided for encryption");
  }

  try {
    const response = await axios.post(`/blockchain/encrypt/${type}`, {
      auditLog: data,
    });

    return response.data.encrypted;
  } catch (error) {
    console.error("Encryption failed:", error.response?.data || error.message);
    throw new Error("Encryption failed");
  }
};

export const decryptData = async (encryptedPayload, type) => {
  if (!encryptedPayload) {
    throw new Error("No encrypted data provided for decryption");
  }

  try {
    const response = await axios.post(`/blockchain/decrypt/${type}`, {
      encrypted: encryptedPayload,
    });
    return response.data.decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.response?.data || error.message);
    throw new Error("Decryption failed");
  }
};

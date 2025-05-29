import { supabaseAdmin } from "../services/supabase.service.js";

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res
      .status(200)
      .json({ message: "User fetched successfully", data: data });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

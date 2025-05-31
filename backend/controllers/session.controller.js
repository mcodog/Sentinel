import { supabaseAdmin } from "../services/supabase.service.js";

// Get all sessions for a doctor
export const getSessions_Doctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
      return res.status(500).json({ error: "Failed to fetch sessions" });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No sessions found for this doctor" });
    }

    return res.status(200).json({
      message: "Sessions fetched successfully",
      data: data,
    });
  } catch (err) {
    console.error("Error fetching sessions for doctor:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all sessions for a user along with user details
export const getSessions_user = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch sessions
    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (sessionError) {
      console.error("Error fetching sessions:", sessionError);
      return res.status(500).json({ error: "Failed to fetch sessions" });
    }

    // Fetch user details
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user details:", userError);
      return res.status(500).json({ error: "Failed to fetch user details" });
    }

    if (!sessions || sessions.length === 0) {
      return res
        .status(404)
        .json({ message: "No sessions found for this user", user });
    }

    return res.status(200).json({
      message: "Sessions and user fetched successfully",
      user,
      sessions,
    });
  } catch (err) {
    console.error("Error fetching sessions and user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

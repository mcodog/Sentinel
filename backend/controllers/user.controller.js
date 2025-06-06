import { supabaseAdmin } from "../services/supabase.service.js";

import { format, formatDistanceToNow } from "date-fns";

function safeFormatDate(dateString, formatter, fallback = "N/A") {
  try {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return formatter(date);
  } catch {
    return fallback;
  }
}

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

    const usersWithAuth = await Promise.all(
      data.map(async (user) => {
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.getUserById(user.auth_id);

        let auth_identity = null;

        if (!authError) {
          const identity = authData?.user?.identities?.[0];
          const lastSignInAt = authData?.user?.last_sign_in_at;
          const createdAt = identity?.created_at;

          if (identity) {
            auth_identity = {
              provider: identity.provider,
              last_sign_in: safeFormatDate(
                lastSignInAt,
                (d) => formatDistanceToNow(d, { addSuffix: true }),
                "Never signed in"
              ),
              created_at: safeFormatDate(
                createdAt,
                (d) => format(d, "MMMM d, yyyy"),
                "Unknown creation date"
              ),
            };
          }
        }

        return {
          ...user,
          auth_identity,
        };
      })
    );

    return res
      .status(200)
      .json({ message: "User fetched successfully", data: usersWithAuth });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_id", id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(id);

    if (authError) {
      console.error("Error fetching auth data:", authError);
      return res.status(500).json({ error: "Failed to fetch auth data" });
    }

    const identity = authData?.user?.identities?.[0];

    let auth_identity = null;

    if (identity) {
      auth_identity = {
        provider: identity.provider,
        last_sign_in: formatDistanceToNow(new Date(identity.last_sign_in_at), {
          addSuffix: true,
        }),
        created_at: format(new Date(identity.created_at), "MMMM d, yyyy"),
      };
    }

    return res.status(200).json({
      message: "User fetched successfully",
      user: userData,
      auth_identity,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

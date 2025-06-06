import { supabaseAdmin } from "../services/supabase.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, gender, dob } = req.body;
    const cleanEmail = email.trim();

    const authId = await createAuthUser(cleanEmail, password);
    const data = await createDbUser({
      auth_id: authId,
      email: cleanEmail,
      username: firstname + " " + lastname,
      firstname,
      lastname,
      gender,
      dob,
    });

    res.json({
      message: "Register successful",
      userId: authId,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createAuthUser = async (email, password) => {
  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data.user.id;
  } catch (e) {
    console.error("Error creating AuthUser:", e);
    throw e;
  }
};

const createDbUser = async (userData) => {
  try {
    const { data, error } = await supabaseAdmin.from("users").insert(userData);
    if (error) {
      throw error;
    }
    console.log(data);
    return data;
  } catch (e) {
    console.error("Error creating DBUser:", e);
    throw e;
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorCode = error.code || error.message || "unknown_error";
      console.log(errorCode);
      return res.status(500).json({ message: errorCode });
    }

    console.log(data.user.id);
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .single();

    if (userError) {
      const userErrorCode =
        userError.code || userError.message || "unknown_userError";
      console.log(userError);
      return res.status(500).json({ message: userErrorCode });
    }

    const parsedUser = {
      email: userData.email,
      role: userData.role,
      created_at: userData.created_at,
      username: userData.username,
      id: userData.auth_id,
      firstname: userData.firstname,
      lastname: userData.lastname,
      gender: userData.gender,
      dob: userData.dob,
    };

    console.log(data);
    return res.status(200).json({ message: "Success", data, parsedUser });
  } catch (e) {
    console.error("Error logging in:", e);
  }
};

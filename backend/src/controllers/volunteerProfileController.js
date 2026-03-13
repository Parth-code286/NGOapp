import supabase from "../config/supabaseClient.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// ===== GET ALL VOLUNTEERS (Public listing) =====
export const getAllVolunteers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Strip password_hash from each volunteer
    const volunteers = data.map(({ password_hash, ...rest }) => rest);

    res.json({ volunteers });
  } catch (err) {
    console.error("Get all volunteers error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== GET VOLUNTEER PROFILE BY ID =====
export const getVolunteerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Volunteer not found." });
    }

    // Strip password_hash
    const { password_hash, ...volunteer } = data;

    res.json({ volunteer });
  } catch (err) {
    console.error("Get volunteer profile error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== UPDATE VOLUNTEER PROFILE =====
export const updateVolunteerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, dob, gender, nationality,
      email, phone,
      city, state, country, pincode,
      aadhar, pan, skills,
    } = req.body;

    // Build update object — only include fields that are provided
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (gender !== undefined) updates.gender = gender;
    if (nationality !== undefined) updates.nationality = nationality;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (country !== undefined) updates.country = country;
    if (pincode !== undefined) updates.pincode = pincode;
    if (aadhar !== undefined) updates.aadhar = aadhar;
    if (pan !== undefined) updates.pan = pan;
    if (skills !== undefined) updates.skills = skills;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const { data, error } = await supabase
      .from("volunteers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Volunteer not found." });

    // Strip password_hash from response
    const { password_hash, ...volunteer } = data;

    res.json({ message: "Profile updated successfully.", volunteer });
  } catch (err) {
    console.error("Update volunteer profile error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== CHANGE PASSWORD =====
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both currentPassword and newPassword are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    // Fetch current password hash
    const { data: volunteer, error: fetchError } = await supabase
      .from("volunteers")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (fetchError || !volunteer) {
      return res.status(404).json({ error: "Volunteer not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, volunteer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from("volunteers")
      .update({ password_hash: newHash })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== DELETE VOLUNTEER ACCOUNT =====
export const deleteVolunteerAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("volunteers")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Volunteer not found." });

    res.json({ message: "Volunteer account deleted successfully." });
  } catch (err) {
    console.error("Delete volunteer error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

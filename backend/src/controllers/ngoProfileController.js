import supabase from "../config/supabaseClient.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// ===== GET ALL NGOs (Public listing) =====
export const getAllNGOs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Strip password_hash from each NGO
    const ngos = data.map(({ password_hash, ...rest }) => rest);

    res.json({ ngos });
  } catch (err) {
    console.error("Get all NGOs error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== GET NGO PROFILE BY ID =====
export const getNGOProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "NGO not found." });
    }

    // Strip password_hash
    const { password_hash, ...ngo } = data;

    res.json({ ngo });
  } catch (err) {
    console.error("Get NGO profile error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== UPDATE NGO PROFILE =====
export const updateNGOProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, type, registrationDate, registrationNo,
      pan, tan, reg12a,
      officialEmail, phone, website,
      address, city, state, pincode,
      authPersonName, authPersonMobile, authPersonEmail,
      logoUrl, description, mission, foundedYear,
    } = req.body;

    // Build update object — only include fields that are provided
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (registrationDate !== undefined) updates.registration_date = registrationDate;
    if (registrationNo !== undefined) updates.registration_no = registrationNo;
    if (pan !== undefined) updates.pan = pan;
    if (tan !== undefined) updates.tan = tan;
    if (reg12a !== undefined) updates.reg_12a = reg12a;
    if (officialEmail !== undefined) updates.official_email = officialEmail;
    if (phone !== undefined) updates.phone = phone;
    if (website !== undefined) updates.website = website;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (authPersonName !== undefined) updates.auth_person_name = authPersonName;
    if (authPersonMobile !== undefined) updates.auth_person_mobile = authPersonMobile;
    if (authPersonEmail !== undefined) updates.auth_person_email = authPersonEmail;
    if (logoUrl !== undefined) updates.logo_url = logoUrl;
    if (description !== undefined) updates.description = description;
    if (mission !== undefined) updates.mission = mission;
    if (foundedYear !== undefined) updates.founded_year = foundedYear;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const { data, error } = await supabase
      .from("ngos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "NGO not found." });

    // Strip password_hash from response
    const { password_hash, ...ngo } = data;

    res.json({ message: "Profile updated successfully.", ngo });
  } catch (err) {
    console.error("Update NGO profile error:", err.message);
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
    const { data: ngo, error: fetchError } = await supabase
      .from("ngos")
      .select("password_hash")
      .eq("id", id)
      .single();

    if (fetchError || !ngo) {
      return res.status(404).json({ error: "NGO not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, ngo.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const { error: updateError } = await supabase
      .from("ngos")
      .update({ password_hash: newHash })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== DELETE NGO ACCOUNT =====
export const deleteNGOAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("ngos")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "NGO not found." });

    res.json({ message: "NGO account deleted successfully." });
  } catch (err) {
    console.error("Delete NGO error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

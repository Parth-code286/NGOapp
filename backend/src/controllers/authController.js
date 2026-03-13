import supabase from "../config/supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "impacthub-secret-key";

// ===== VOLUNTEER REGISTRATION =====
export const registerVolunteer = async (req, res) => {
  try {
    const {
      fullName, dob, gender, nationality,
      email, phone,
      city, state, country, pincode,
      lat, lng,
      aadhar, pan, skills, password,
      id_proof_url, skill_proof_url,
    } = req.body;
    
    // Check if email already exists
    const { data: existing } = await supabase
      .from("volunteers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from("volunteers")
      .insert([{
        name: fullName,
        dob,
        gender,
        nationality,
        email,
        phone,
        city,
        state,
        country,
        pincode,
        lat: lat || null,
        lng: lng || null,
        aadhar,
        pan,
        skills,
        password_hash: passwordHash,
        id_proof_url,
        skill_proof_url,
      }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, role: "volunteer" }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "Volunteer registered successfully.", token, user: { id: data.id, name: data.name, email: data.email, role: "volunteer" } });
  } catch (err) {
    console.error("Volunteer registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== NGO REGISTRATION =====
export const registerNGO = async (req, res) => {
  try {
    const {
      ngoName, ngoType, regDate, regNo,
      pan, tan, reg12a,
      officialEmail, ngoPhone, website,
      ngoAddress, ngoCity, ngoState, ngoPincode,
      authName, authMobile, authEmail,
      password,
    } = req.body;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("ngos")
      .select("id")
      .eq("official_email", officialEmail)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from("ngos")
      .insert([{
        name: ngoName,
        type: ngoType,
        registration_date: regDate,
        registration_no: regNo,
        pan,
        tan,
        reg_12a: reg12a,
        official_email: officialEmail,
        phone: ngoPhone,
        website,
        address: ngoAddress,
        city: ngoCity,
        state: ngoState,
        pincode: ngoPincode,
        auth_person_name: authName,
        auth_person_mobile: authMobile,
        auth_person_email: authEmail,
        password_hash: passwordHash,
        verification_status: 'pending',
        is_verified: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: "Registration submitted successfully! Please wait for admin approval. You will be notified via email once your account is verified.",
      user: { id: data.id, name: data.name, email: data.official_email, role: "ngo" } 
    });
  } catch (err) {
    console.error("NGO registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// ===== LOGIN =====
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body; // role: 'volunteer' | 'ngo'

    let data, error;

    if (role === "volunteer") {
      const result = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", email)
        .single();
      data = result.data;
      error = result.error;
    } else if (role === "ngo") {
      const result = await supabase
        .from("ngos")
        .select("*")
        .eq("official_email", email)
        .single();
      data = result.data;
      error = result.error;
    } else {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    if (error || !data) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, data.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (role === "ngo") {
      if (data.verification_status === 'pending') {
        return res.status(403).json({ error: "Your account is pending admin approval. Please wait for verification." });
      }
      if (data.verification_status === 'rejected') {
        return res.status(403).json({ 
          error: `Your account has been rejected. Reason: ${data.rejection_reason || 'No reason provided.'}. You can re-register with correct information.` 
        });
      }
    }

    const token = jwt.sign({ id: data.id, role }, JWT_SECRET, { expiresIn: "7d" });

    const userName = role === "volunteer" ? data.name : data.name;
    const userEmail = role === "volunteer" ? data.email : data.official_email;

    res.json({ message: "Login successful.", token, user: { id: data.id, name: userName, email: userEmail, role } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

import supabase from "../config/supabaseClient.js";
import { sendEmail } from "../utils/emailService.js";

// GET /api/admin/ngos - Fetch all NGOs
export const getAllNGOs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ngos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ ngos: data });
  } catch (err) {
    console.error("Admin fetch NGOs error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const verifyNGO = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body; // 'verified' or 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use 'verified' or 'rejected'." });
  }

  try {
    const { data: ngo, error: fetchError } = await supabase
      .from("ngos")
      .select("official_email, name")
      .eq("id", id)
      .single();

    if (fetchError || !ngo) {
      return res.status(404).json({ error: "NGO not found." });
    }

    const updatePayload = { 
      is_verified: status === 'verified',
      verification_status: status 
    };

    if (status === 'rejected') {
      updatePayload.rejection_reason = reason;
    } else {
      updatePayload.rejection_reason = null; // Clear reason if approved
    }

    const { error: updateError } = await supabase
      .from("ngos")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) throw updateError;

    // Send Actual Notification Email
    const subject = "Your NGO verification status on ImpactHub";
    let emailBody = `Hello ${ngo.name},\n\nYour organization registration has been ${status} by our admin team.`;
    
    if (status === 'rejected') {
      emailBody += `\n\nReason: ${reason}\n\nYou can re-register with the correct details.`;
    } else {
      emailBody += `\n\nYou can now log in to your organization dashboard.`;
    }

    await sendEmail(ngo.official_email, subject, emailBody);

    res.json({ message: `NGO has been ${status} successfully.`, ngo_name: ngo.name });
  } catch (err) {
    console.error("Admin verify NGO error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

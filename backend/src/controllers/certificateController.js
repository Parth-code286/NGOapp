import { certificateModel } from "../models/certificateModel.js";

// POST /api/certificates
export const issueCertificate = async (req, res) => {
  const { volunteer_id, ngo_id, event_id, certificate_url } = req.body;
  
  if (!volunteer_id || !ngo_id || !event_id) {
    return res.status(400).json({ error: "Volunteer ID, NGO ID, and Event ID are required." });
  }

  try {
    const certificate = await certificateModel.create({
      volunteer_id,
      ngo_id,
      event_id,
      certificate_url
    });
    res.status(201).json({ message: "Certificate issued successfully.", certificate });
  } catch (err) {
    console.error("Issue Certificate Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/certificates/volunteer/:id
export const getVolunteerCertificates = async (req, res) => {
  try {
    const certificates = await certificateModel.getByVolunteer(req.params.id);
    res.status(200).json({ certificates });
  } catch (err) {
    console.error("Fetch Volunteer Certificates Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/certificates/ngo/:id
export const getNGOCertificates = async (req, res) => {
  try {
    const certificates = await certificateModel.getByNGO(req.params.id);
    res.status(200).json({ certificates });
  } catch (err) {
    console.error("Fetch NGO Certificates Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

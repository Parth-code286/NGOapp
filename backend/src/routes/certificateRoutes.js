import express from "express";
import { 
  issueCertificate, 
  getVolunteerCertificates, 
  getNGOCertificates 
} from "../controllers/certificateController.js";

const router = express.Router();

// Issue a new certificate
router.post("/", issueCertificate);

// Get all certificates for a specific volunteer
router.get("/volunteer/:id", getVolunteerCertificates);

// Get all certificates issued by a specific NGO
router.get("/ngo/:id", getNGOCertificates);

export default router;

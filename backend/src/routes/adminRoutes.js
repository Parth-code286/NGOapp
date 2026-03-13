import { Router } from "express";
import { getAllNGOs, verifyNGO } from "../controllers/adminController.js";

const router = Router();

// GET /api/admin/ngos - List all NGOs
router.get("/ngos", getAllNGOs);

// PUT /api/admin/ngos/:id/verify - Verify (Approve/Reject) NGO
router.put("/ngos/:id/verify", verifyNGO);

export default router;

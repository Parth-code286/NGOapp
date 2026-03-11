import { Router } from "express";
import {
  getAllNGOs,
  getNGOProfile,
  updateNGOProfile,
  changePassword,
  deleteNGOAccount,
} from "../controllers/ngoProfileController.js";

const router = Router();

// GET /api/ngo — List all NGOs (public)
router.get("/", getAllNGOs);

// GET /api/ngo/:id — Get NGO profile by ID
router.get("/:id", getNGOProfile);

// PUT /api/ngo/:id — Update NGO profile
router.put("/:id", updateNGOProfile);

// PUT /api/ngo/:id/password — Change password
router.put("/:id/password", changePassword);

// DELETE /api/ngo/:id — Delete NGO account
router.delete("/:id", deleteNGOAccount);

export default router;

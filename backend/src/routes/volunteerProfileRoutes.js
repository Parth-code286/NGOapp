import { Router } from "express";
import {
  getAllVolunteers,
  getVolunteerProfile,
  updateVolunteerProfile,
  changePassword,
  deleteVolunteerAccount,
} from "../controllers/volunteerProfileController.js";

const router = Router();

// GET /api/volunteer — List all volunteers
router.get("/", getAllVolunteers);

// GET /api/volunteer/:id — Get volunteer profile by ID
router.get("/:id", getVolunteerProfile);

// PUT /api/volunteer/:id — Update volunteer profile
router.put("/:id", updateVolunteerProfile);

// PUT /api/volunteer/:id/password — Change password
router.put("/:id/password", changePassword);

// DELETE /api/volunteer/:id — Delete volunteer account
router.delete("/:id", deleteVolunteerAccount);

export default router;

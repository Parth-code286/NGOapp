import { Router } from "express";
import {
  inviteVolunteer,
  getVolunteerInvites,
  updateInviteStatus
} from "../controllers/inviteController.js";

const router = Router();

// POST /api/invites - Invite a volunteer to an event
router.post("/", inviteVolunteer);

// GET /api/invites/volunteer/:volunteerId - Get all invites for a volunteer
router.get("/volunteer/:volunteerId", getVolunteerInvites);

// PUT /api/invites/:id/status - Accept or decline an invite
router.put("/:id/status", updateInviteStatus);

export default router;

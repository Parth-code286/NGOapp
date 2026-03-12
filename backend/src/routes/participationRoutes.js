import express from "express";
import { 
  getNGOHandledParticipation, 
  updateParticipationStatus, 
  approveAllParticipation 
} from "../controllers/participationController.js";

const router = express.Router();

router.get("/:ngoId", getNGOHandledParticipation);
router.put("/:id/status", updateParticipationStatus);
router.post("/approve-all/:ngoId", approveAllParticipation);

export default router;

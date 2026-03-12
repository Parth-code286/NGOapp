import express from "express";
import {
  getCalendar,
  setDateAvailability,
  bulkSetAvailability,
} from "../controllers/calendarController.js";

const router = express.Router();

// GET  /api/calendar/:volunteerId        — load availability + registered events
router.get("/:volunteerId", getCalendar);

// PUT  /api/calendar/:volunteerId/date   — set single date (busy/available)
router.put("/:volunteerId/date", setDateAvailability);

// PUT  /api/calendar/:volunteerId/bulk   — bulk save multiple dates
router.put("/:volunteerId/bulk", bulkSetAvailability);

export default router;

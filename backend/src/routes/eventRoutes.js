import express from "express";
import {
    // Event CRUD
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByNgo,
    // Event Roles
    createRole,
    getRoles,
    updateRole,
    deleteRole,
    // Event Registrations
    registerForEvent,
    getEventRegistrations,
    getVolunteerRegistrations,
    updateRegistrationStatus,
    cancelRegistration,
    // Gamification
    joinEvent,
    verifyAttendance,
} from "../controllers/eventController.js";
import { completeTask, crisisParticipate } from "../controllers/gamificationController.js";

const router = express.Router();

// ─── Event CRUD ───────────────────────────────────────────────
router.post("/", createEvent);                          // POST   /events
router.get("/", getAllEvents);                           // GET    /events
router.get("/ngo/:ngoId", getEventsByNgo);              // GET    /events/ngo/:ngoId
router.get("/:id", getEventById);                       // GET    /events/:id
router.put("/:id", updateEvent);                        // PUT    /events/:id
router.delete("/:id", deleteEvent);                     // DELETE /events/:id

// ─── Event Roles ──────────────────────────────────────────────
router.post("/:eventId/roles", createRole);             // POST   /events/:eventId/roles
router.get("/:eventId/roles", getRoles);                // GET    /events/:eventId/roles
router.put("/roles/:roleId", updateRole);               // PUT    /events/roles/:roleId
router.delete("/roles/:roleId", deleteRole);            // DELETE /events/roles/:roleId

// ─── Event Registrations ──────────────────────────────────────
router.post("/:eventId/register", registerForEvent);                        // POST   /events/:eventId/register
router.get("/:eventId/registrations", getEventRegistrations);               // GET    /events/:eventId/registrations
router.get("/registrations/volunteer/:volunteerId", getVolunteerRegistrations); // GET /events/registrations/volunteer/:volunteerId
router.put("/registrations/:registrationId/status", updateRegistrationStatus); // PUT /events/registrations/:registrationId/status
router.delete("/:eventId/register/:volunteerId", cancelRegistration);       // DELETE /events/:eventId/register/:volunteerId

// ─── Gamification ─────────────────────────────────────────────
router.post("/join", joinEvent);                        // POST   /events/join
router.post("/verify-attendance", verifyAttendance);    // POST   /events/verify-attendance
router.post("/tasks/complete", completeTask);           // POST   /events/tasks/complete
router.post("/crisis/participate", crisisParticipate);  // POST   /events/crisis/participate

export default router;

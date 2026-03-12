import { eventModel } from "../models/eventModel.js";
import { volunteerModel } from "../models/volunteerModel.js";
import { awardPoints } from "../services/pointsService.js";
import supabase from "../config/supabaseClient.js";

// ═══════════════════════════════════════════════════════════════
//  EVENT CRUD
// ═══════════════════════════════════════════════════════════════

// POST /events — Create a new event
export const createEvent = async (req, res) => {
    try {
        const event = await eventModel.create(req.body);

        // If emergency, broadcast to all volunteers
        if (req.body.is_emergency) {
            const { data: volunteers } = await supabase.from("volunteers").select("id");
            if (volunteers && volunteers.length > 0) {
                const notifications = volunteers.map(v => ({
                    user_id: v.id,
                    title: "🚨 URGENT: Emergency Event",
                    message: `A new emergency event has been posted: ${event.title}. Your immediate help is needed!`,
                    type: "emergency_event",
                    related_id: event.id,
                    is_read: false
                }));
                await supabase.from("notifications").insert(notifications);
            }
        }

        return res.status(201).json({ message: "Event created.", event });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /events — List all events (with optional filters)
export const getAllEvents = async (req, res) => {
    try {
        const { category, mode, status, city, ngo_id } = req.query;
        const events = await eventModel.getAll({ category, mode, status, city, ngo_id });
        return res.status(200).json({ count: events.length, events });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /events/:id — Get event details
export const getEventById = async (req, res) => {
    try {
        const event = await eventModel.getById(req.params.id);
        const roles = await eventModel.getRolesByEvent(req.params.id);
        return res.status(200).json({ event, roles });
    } catch (err) {
        return res.status(404).json({ error: "Event not found." });
    }
};

// PUT /events/:id — Update event
export const updateEvent = async (req, res) => {
    try {
        const event = await eventModel.update(req.params.id, req.body);
        return res.status(200).json({ message: "Event updated.", event });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE /events/:id — Delete event
export const deleteEvent = async (req, res) => {
    try {
        await eventModel.delete(req.params.id);
        return res.status(200).json({ message: "Event deleted." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /events/ngo/:ngoId — Get all events by NGO
export const getEventsByNgo = async (req, res) => {
    try {
        const events = await eventModel.getByNgo(req.params.ngoId);
        return res.status(200).json({ count: events.length, events });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
//  EVENT ROLES
// ═══════════════════════════════════════════════════════════════

// POST /events/:eventId/roles — Add a role to an event
export const createRole = async (req, res) => {
    try {
        const role = await eventModel.createRole({
            event_id: req.params.eventId,
            ...req.body,
        });
        return res.status(201).json({ message: "Role created.", role });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /events/:eventId/roles — List all roles for an event
export const getRoles = async (req, res) => {
    try {
        const roles = await eventModel.getRolesByEvent(req.params.eventId);
        return res.status(200).json({ roles });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// PUT /events/roles/:roleId — Update a role
export const updateRole = async (req, res) => {
    try {
        const role = await eventModel.updateRole(req.params.roleId, req.body);
        return res.status(200).json({ message: "Role updated.", role });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE /events/roles/:roleId — Delete a role
export const deleteRole = async (req, res) => {
    try {
        await eventModel.deleteRole(req.params.roleId);
        return res.status(200).json({ message: "Role deleted." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
//  EVENT REGISTRATIONS
// ═══════════════════════════════════════════════════════════════

// POST /events/:eventId/register — Volunteer registers for an event
export const registerForEvent = async (req, res) => {
    const { volunteer_id, role_id } = req.body;
    if (!volunteer_id)
        return res.status(400).json({ error: "volunteer_id is required." });

    try {
        const registration = await eventModel.registerVolunteer({
            event_id: req.params.eventId,
            volunteer_id,
            role_id: role_id || null,
        });
        return res.status(201).json({ message: "Registered for event.", registration });
    } catch (err) {
        if (err.message.includes("duplicate")) {
            return res.status(409).json({ error: "Already registered for this event." });
        }
        return res.status(500).json({ error: err.message });
    }
};

// GET /events/:eventId/registrations — Get all registrations for event
export const getEventRegistrations = async (req, res) => {
    try {
        const registrations = await eventModel.getRegistrationsByEvent(req.params.eventId);
        return res.status(200).json({ count: registrations.length, registrations });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET /events/registrations/volunteer/:volunteerId — Get all events a volunteer registered for
export const getVolunteerRegistrations = async (req, res) => {
    try {
        const registrations = await eventModel.getRegistrationsByVolunteer(req.params.volunteerId);
        return res.status(200).json({ count: registrations.length, registrations });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// PUT /events/registrations/:registrationId/status — Approve/reject/waitlist
export const updateRegistrationStatus = async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected", "waitlisted"].includes(status))
        return res.status(400).json({ error: "Status must be approved, rejected, or waitlisted." });

    try {
        const registration = await eventModel.updateRegistrationStatus(req.params.registrationId, status);
        return res.status(200).json({ message: `Registration ${status}.`, registration });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// DELETE /events/:eventId/register/:volunteerId — Cancel registration
export const cancelRegistration = async (req, res) => {
    try {
        await eventModel.cancelRegistration(req.params.eventId, req.params.volunteerId);
        return res.status(200).json({ message: "Registration cancelled." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
//  GAMIFICATION (existing)
// ═══════════════════════════════════════════════════════════════

// POST /events/join
export const joinEvent = async (req, res) => {
    const { volunteer_id, event_id } = req.body;
    if (!volunteer_id || !event_id)
        return res.status(400).json({ error: "volunteer_id and event_id are required." });

    try {
        const existing = await eventModel.getAttendance(volunteer_id, event_id);
        if (existing)
            return res.status(409).json({ error: "Volunteer already joined this event." });

        await eventModel.createAttendance(volunteer_id, event_id);
        const result = await awardPoints(volunteer_id, 20, "join_event", event_id);

        return res.status(201).json({
            message: "Successfully joined event.",
            points_awarded: 20,
            total_points: result.newPoints,
            level: result.newLevel,
            new_badges: result.newBadges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// POST /events/verify-attendance
export const verifyAttendance = async (req, res) => {
    const { volunteer_id, event_id } = req.body;
    if (!volunteer_id || !event_id)
        return res.status(400).json({ error: "volunteer_id and event_id are required." });

    try {
        const attendance = await eventModel.verifyAttendance(volunteer_id, event_id);
        if (!attendance)
            return res.status(404).json({ error: "Attendance record not found." });

        const eventsAttended = await volunteerModel.incrementEventsAttended(volunteer_id);
        const result = await awardPoints(volunteer_id, 50, "attendance_verified", event_id);

        return res.status(200).json({
            message: "Attendance verified.",
            points_awarded: 50,
            total_points: result.newPoints,
            level: result.newLevel,
            events_attended: eventsAttended,
            new_badges: result.newBadges,
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

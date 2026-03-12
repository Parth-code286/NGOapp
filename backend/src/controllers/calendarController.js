import { calendarModel } from "../models/calendarModel.js";

// GET /api/calendar/:volunteerId
export const getCalendar = async (req, res) => {
  const { volunteerId } = req.params;
  try {
    // Fetch availability — gracefully handle missing table
    let availability = [];
    try {
      availability = await calendarModel.getAvailability(volunteerId);
    } catch (e) {
      // Table may not exist yet — that's OK, return empty
      console.log("Availability table not ready:", e.message);
    }

    // Fetch registered events — this uses event_registrations which always exists
    let registrations = [];
    try {
      registrations = await calendarModel.getRegisteredEvents(volunteerId);
    } catch (e) {
      console.log("Could not fetch registered events:", e.message);
    }

    // Transform registrations into a date-keyed map for the frontend
    const events = {};
    for (const reg of registrations) {
      if (reg.events?.event_date) {
        events[reg.events.event_date] = {
          name:  reg.events.title,
          category: reg.events.category,
          time:  reg.events.start_time?.slice(0, 5),
          city:  reg.events.city,
          mode:  reg.events.mode,
        };
      }
    }

    return res.status(200).json({ availability, events });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/calendar/:volunteerId/date
export const setDateAvailability = async (req, res) => {
  const { volunteerId } = req.params;
  const { date, status, reason } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: "date and status are required." });
  }
  if (!["available", "busy"].includes(status)) {
    return res.status(400).json({ error: "status must be 'available' or 'busy'." });
  }

  try {
    if (status === "available") {
      // Remove from DB → default is available
      await calendarModel.removeAvailability(volunteerId, date);
      return res.status(200).json({ message: "Date set to available.", date, status });
    }

    const entry = await calendarModel.setAvailability(volunteerId, date, status, reason || null);
    return res.status(200).json({ message: "Availability saved.", entry });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/calendar/:volunteerId/bulk
export const bulkSetAvailability = async (req, res) => {
  const { volunteerId } = req.params;
  const { entries } = req.body;

  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "entries array is required." });
  }

  try {
    const results = await calendarModel.bulkSet(volunteerId, entries);
    return res.status(200).json({ message: `${results.length} entries saved.`, results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

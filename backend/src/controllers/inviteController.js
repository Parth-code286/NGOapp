import { inviteModel } from "../models/inviteModel.js";
import { notificationModel } from "../models/notificationModel.js";

export const inviteVolunteer = async (req, res) => {
  try {
    const { volunteerId, ngoId, eventId, ngoName, eventTitle } = req.body;
    
    // 1. Create the invite
    const invite = await inviteModel.create(volunteerId, ngoId, eventId);

    // 2. Send a notification to the volunteer
    await notificationModel.create({
      user_id: volunteerId,
      title: "New Event Invite! 💌",
      message: `${ngoName} has invited you to volunteer for "${eventTitle} ". Check your Invites tab!`,
      type: "success",
      icon: "💌"
    });

    res.status(201).json({ message: "Volunteer invited successfully.", invite });
  } catch (err) {
    if (err.message.includes("already invited")) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getVolunteerInvites = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const invites = await inviteModel.getByVolunteer(volunteerId);
    res.json({ invites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateInviteStatus = async (req, res) => {
  try {
    const { id } = req.params; // Invite ID
    const { status } = req.body; // 'accepted' or 'declined'
    
    // 1. Fetch invite details to get NGO ID and info
    const invite = await inviteModel.getById(id);
    if (!invite) return res.status(404).json({ error: "Invite not found." });

    // 2. Update status
    await inviteModel.updateStatus(id, status);

    // 3. Notify the NGO
    const volunteerName = invite.volunteers?.name || "A volunteer";
    const eventTitle = invite.events?.title || "your event";
    
    await notificationModel.create({
      user_id: invite.ngo_id,
      title: `Invite ${status === 'accepted' ? 'Accepted' : 'Declined'}!`,
      message: `${volunteerName} has ${status} your invitation to "${eventTitle}".`,
      type: status === 'accepted' ? 'success' : 'warning',
      icon: status === 'accepted' ? '✅' : '❌'
    });

    res.json({ message: `Invite ${status}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

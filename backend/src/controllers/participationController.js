import { eventModel } from "../models/eventModel.js";
import { inviteModel } from "../models/inviteModel.js";
import { notificationModel } from "../models/notificationModel.js";
import supabase from "../config/supabaseClient.js";

// GET /api/participation/:ngoId — Get all volunteers seeking to participate (registrations + accepted invites)
export const getNGOHandledParticipation = async (req, res) => {
  try {
    const { ngoId } = req.params;

    // 1. Fetch Registrations (pending ones usually)
    const registrations = await eventModel.getRegistrationsByNGO(ngoId);
    
    // 2. Fetch Invites (accepted ones wait for NGO approval)
    const invites = await inviteModel.getByNGO(ngoId);

    // Format them for a unified UI
    const participationRequests = [
      ...registrations.map(r => ({
        id: r.id,
        type: 'registration',
        volunteer: r.volunteers,
        event: r.events,
        status: r.status,
        created_at: r.created_at
      })),
      ...invites.map(i => ({
        id: i.id,
        type: 'invite',
        volunteer: i.volunteers,
        event: i.events,
        status: i.status,
        created_at: i.created_at
      }))
    ];

    // Filter for those that actually need action (Pending or Accepted but not yet finalized)
    const filtered = participationRequests.filter(p => 
      (p.type === 'registration' && (p.status === 'pending' || !p.status)) || 
      (p.type === 'invite' && p.status === 'accepted')
    );

    res.json({ participation: filtered });
  } catch (err) {
    console.error("NGO Participation Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/participation/:id/status — Approve or Reject
export const updateParticipationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, type } = req.body; // 'approved' or 'rejected', type: 'registration' or 'invite'

    let volunteerId, eventTitle, ngoName;

    if (type === 'registration') {
      // 1. Fetch registration details to get volunteer and event info
      const { data: reg, error } = await supabase
        .from("event_registrations")
        .select("volunteer_id, events(title, ngos(name))")
        .eq("id", id)
        .single();
      
      if (error) throw new Error(error.message);
      volunteerId = reg.volunteer_id;
      eventTitle = reg.events?.title;
      ngoName = reg.events?.ngos?.name || "An NGO";

      // 2. Update status
      await eventModel.updateRegistrationStatus(id, status);
    } else {
      // 1. Fetch invite details
      const invite = await inviteModel.getById(id);
      if (!invite) throw new Error("Invite not found");
      
      volunteerId = invite.volunteer_id;
      eventTitle = invite.events?.title;
      // Fetch NGO name from the invite's NGO relation
      const { data: ngoData } = await supabase
        .from("ngos")
        .select("name")
        .eq("id", invite.ngo_id)
        .single();
      ngoName = ngoData?.name || "the NGO"; 

      // 2. Update status
      await inviteModel.updateStatus(id, status);
    }

    // 3. Notify the volunteer
    await notificationModel.create({
      user_id: volunteerId,
      title: `Participation ${status === 'approved' ? 'Approved' : 'Rejected'}!`,
      message: `${ngoName} has ${status} your participation for "${eventTitle}".`,
      type: status === 'approved' ? 'success' : 'warning',
      icon: status === 'approved' ? '✅' : '❌'
    });

    res.json({ message: `Participation ${status}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/participation/approve-all/:ngoId
export const approveAllParticipation = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { items } = req.body; // Array of { id, type }

    for (const item of items) {
       // Re-use the individual logic for simplicity and notification consistency
       // In a high-traffic app, we'd batch this, but for now this is cleaner
       await updateParticipationStatus({ 
          params: { id: item.id },
          body: { status: 'approved', type: item.type }
       }, { 
          json: () => {}, 
          status: () => ({ json: () => {} }) 
       });
    }

    res.json({ message: "All selected participation requests approved." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

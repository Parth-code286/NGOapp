import supabase from "../config/supabaseClient.js";

// Memory cache to prevent hitting openstreetmap rate limits for the same city repeatedly
const geoCache = {};

async function geocodeLocation(city, state, country) {
  // Safe filtering: remove null/undefined/empty segments
  const segments = [city, state, country || 'India'].filter(seg => seg && seg !== 'null' && seg !== 'undefined');
  const query = segments.join(', ').trim();
  
  if (!query || geoCache[query]) return geoCache[query];

  try {
    // Add 1s delay to respect Nominatim policy
    await new Promise(r => setTimeout(r, 1100));

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        'User-Agent': 'ImpactHub-Analytics/1.0 (contact@impacthub.org)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'http://localhost:5053/'
      }
    });

    if (res.status === 429) {
      console.warn("Nominatim Rate Limit hit on backend.");
      return null;
    }

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        geoCache[query] = coords;
        return coords;
      }
    }
  } catch (err) {
    console.error(`Geocoding HTTP failed for ${query} - ${err.message}`);
  }

  return null;
}

// GET /api/analytics/volunteer-heatmap
// Supports query params: ?days=30 (registered in last N days) & ?eventId=UUID (only attendees of specific event)
export const getVolunteerHeatmap = async (req, res) => {
  try {
    const { days, eventId } = req.query;

    let volunteers = [];

    if (eventId) {
      // Filter 2: Exact Event Attendees (Heatmap of where attendees came from)
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          volunteers (
            city, state, pincode, interests
          )
        `)
        .eq("event_id", eventId)
        .eq("status", "approved"); // Only count approved attendees

      if (error) throw error;
      // Flatten the joined data
      volunteers = data.map(reg => reg.volunteers).filter(Boolean);

    } else {
      // Base query: attempt to fetch with lat/lng
      let queryUrl = "city, state, pincode, country, interests, created_at, lat, lng";
      let queryFn = (qUrl) => {
        let q = supabase.from("volunteers").select(qUrl);
        if (days && !isNaN(days)) {
          const dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - parseInt(days));
          q = q.gte("created_at", dateLimit.toISOString());
        }
        return q;
      };

      let { data, error } = await queryFn(queryUrl);

      // If lat/lng columns don't exist yet, fallback to query without them
      if (error && error.message && error.message.includes("does not exist")) {
        console.log("lat/lng columns not found in Supabase. Falling back to pure geocoding.");
        queryUrl = "city, state, pincode, country, interests, created_at";
        const fallback = await queryFn(queryUrl);
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error) throw error;
      volunteers = data;
    }

    // Grouping by City
    const locationMap = {};

    volunteers.forEach((vol) => {
      let loc = vol.city ? vol.city.trim() : (vol.state ? vol.state.trim() : "Unknown");
      if (!loc) loc = "Unknown";
      
      loc = loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();

      if (!locationMap[loc]) {
        locationMap[loc] = { location: loc, categories: {}, total: 0 };
      }
      locationMap[loc].total += 1;

      // Process interests
      if (vol.interests) {
        const interestsList = vol.interests.split(",").map(i => i.trim().toLowerCase());
        interestsList.forEach(interest => {
          if (!interest) return;
          if (!locationMap[loc].categories[interest]) locationMap[loc].categories[interest] = 0;
          locationMap[loc].categories[interest] += 1;
        });
      }
    });

    // Resolve Lat/Lng for each location group
    const heatmapData = Object.values(locationMap).sort((a, b) => b.total - a.total);
    
    // Attempt to geocode each group (if not already cached)
    for (const group of heatmapData) {
      if (group.location !== "Unknown") {
        // Find a representative volunteer for this group to get state/country
        const rep = volunteers.find(v => (v.city && v.city.toLowerCase() === group.location.toLowerCase()) || (v.state && v.state.toLowerCase() === group.location.toLowerCase()));
        
        // If the volunteer already had exact GPS from mobile/browser, use that!
        if (rep && rep.lat && rep.lng) {
           group.lat = rep.lat;
           group.lng = rep.lng;
        } else if (rep) {
           // Fallback to geocoding the city name
           const coords = await geocodeLocation(group.location, rep.state, rep.country);
           if (coords) {
             group.lat = coords.lat;
             group.lng = coords.lng;
           }
        }
      }
    }

    res.status(200).json({ heatmap: heatmapData });
  } catch (err) {
    console.error("Heatmap Analytics Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/stats
// Returns advanced global statistics across the platform
export const getAdvancedStats = async (req, res) => {
  try {
    // 1. Total Volunteers
    const { count: totalVolunteers, error: volError } = await supabase
      .from("volunteers")
      .select("*", { count: 'exact', head: true });
    if (volError) throw volError;

    // 2. Active Events (Total events organized)
    const { count: totalEvents, error: evError } = await supabase
      .from("events")
      .select("*", { count: 'exact', head: true });
    if (evError) throw evError;

    // 3. Overall Attendance Rate
    // Count total registrations vs approved/attended registrations
    const { count: totalRegistrations, error: regError } = await supabase
      .from("event_registrations")
      .select("*", { count: 'exact', head: true });
    
    const { count: approvedRegistrations, error: appError } = await supabase
      .from("event_registrations")
      .select("*", { count: 'exact', head: true })
      .eq("status", "approved");

    const attendanceRate = totalRegistrations > 0 
      ? Math.round((approvedRegistrations / totalRegistrations) * 100) 
      : 0;

    // 4. Top Active City
    const { data: cityData, error: cityError } = await supabase
      .from("volunteers")
      .select("city");
    
    let topCity = "Unknown";
    if (cityData && cityData.length > 0) {
      const cityCounts = {};
      cityData.forEach(v => {
        if (v.city) {
          const c = v.city.trim().toUpperCase();
          cityCounts[c] = (cityCounts[c] || 0) + 1;
        }
      });
      const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
      if (sortedCities.length > 0) {
         topCity = sortedCities[0][0].charAt(0) + sortedCities[0][0].slice(1).toLowerCase();
      }
    }

    res.status(200).json({
      totalVolunteers: totalVolunteers || 0,
      totalEvents: totalEvents || 0,
      attendanceRate: `${attendanceRate}%`,
      topCity
    });
  } catch (err) {
    console.error("Advanced Stats Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/impact-score
// Calculates a platform-wide social impact score
export const getCommunityImpactScore = async (req, res) => {
  try {
    // 1. Sum of all volunteer points
    const { data: pointsData, error: pointsError } = await supabase
      .from("volunteers")
      .select("points");
    if (pointsError) throw pointsError;
    const totalPoints = pointsData.reduce((sum, v) => sum + (v.points || 0), 0);

    // 2. Count of approved registrations
    const { count: approvedCount, error: approvedError } = await supabase
      .from("event_registrations")
      .select("*", { count: 'exact', head: true })
      .eq("status", "approved");
    if (approvedError) throw approvedError;

    // 3. Count of events
    const { count: eventCount, error: eventError } = await supabase
      .from("events")
      .select("*", { count: 'exact', head: true });
    if (eventError) throw eventError;

    // 4. Unique participating cities
    const { data: cityData, error: cityError } = await supabase
      .from("volunteers")
      .select("city")
      .not("city", "is", null);
    if (cityError) throw cityError;
    const uniqueCities = new Set(cityData.map(v => v.city.trim().toUpperCase())).size;

    // Calculate Scores (Weights can be adjusted)
    const contributionScore = Math.round(totalPoints / 10); // 1 score unit per 10 points
    const participationScore = (approvedCount || 0) * 50;  // 50 score units per approved participant
    const diversityScore = uniqueCities * 100;           // 100 score units per city reached
    const frequencyScore = (eventCount || 0) * 200;       // 200 score units per event hosted

    const totalImpactScore = contributionScore + participationScore + diversityScore + frequencyScore;

    res.status(200).json({
      totalImpactScore,
      breakdown: {
        contributionScore,
        participationScore,
        diversityScore,
        frequencyScore
      },
      metrics: {
        totalPoints,
        approvedCount: approvedCount || 0,
        eventCount: eventCount || 0,
        uniqueCities
      }
    });
  } catch (err) {
    console.error("Impact Score Calculation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

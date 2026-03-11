import React, { useState } from 'react';
import './BrowseVolunteers.css';

// Dummy volunteer data
const VOLUNTEERS = [
  {
    id: 1, name: 'Ananya Sharma', age: 23, gender: 'Female', city: 'Mumbai', state: 'Maharashtra',
    email: 'ananya.sharma@email.com', phone: '+91 98765 43210', nationality: 'Indian',
    interests: 'Environment', aadhar: 'XXXX-XXXX-1234', pan: 'ABCDE1234F',
    eventsAttended: 12, hoursVolunteered: 48, impactPoints: 3200, rating: 4.9,
    skills: ['Teaching', 'Photography', 'Social Media'],
    about: 'Passionate about environmental conservation and youth education. Available on weekends.',
    avatar: 'A', joined: 'Jan 2026',
  },
  {
    id: 2, name: 'Rahul Mehta', age: 27, gender: 'Male', city: 'Pune', state: 'Maharashtra',
    email: 'rahul.mehta@email.com', phone: '+91 87654 32109', nationality: 'Indian',
    interests: 'Healthcare', aadhar: 'XXXX-XXXX-5678', pan: 'FGHIJ5678K',
    eventsAttended: 10, hoursVolunteered: 40, impactPoints: 2980, rating: 4.7,
    skills: ['Medical Support', 'Logistics', 'Crowd Management'],
    about: 'Medical student with experience in health camps and first aid.',
    avatar: 'R', joined: 'Dec 2025',
  },
  {
    id: 3, name: 'Priya Singh', age: 21, gender: 'Female', city: 'Delhi', state: 'Delhi',
    email: 'priya.singh@email.com', phone: '+91 76543 21098', nationality: 'Indian',
    interests: 'Education', aadhar: 'XXXX-XXXX-9012', pan: 'KLMNO9012P',
    eventsAttended: 9, hoursVolunteered: 36, impactPoints: 2740, rating: 4.8,
    skills: ['Teaching', 'Counseling', 'Social Media'],
    about: 'Education enthusiast. Loves conducting workshops and mentoring young students.',
    avatar: 'P', joined: 'Feb 2026',
  },
  {
    id: 4, name: 'Arjun Nair', age: 29, gender: 'Male', city: 'Bangalore', state: 'Karnataka',
    email: 'arjun.nair@email.com', phone: '+91 65432 10987', nationality: 'Indian',
    interests: 'Community Service',  aadhar: 'XXXX-XXXX-3456', pan: 'QRSTU3456V',
    eventsAttended: 8, hoursVolunteered: 32, impactPoints: 2400, rating: 4.6,
    skills: ['IT Support', 'Logistics', 'Photography'],
    about: 'Software engineer by day, community builder by heart. Runs a local coding bootcamp.',
    avatar: 'A', joined: 'Jan 2026',
  },
  {
    id: 5, name: 'Meera Joshi', age: 25, gender: 'Female', city: 'Jaipur', state: 'Rajasthan',
    email: 'meera.joshi@email.com', phone: '+91 54321 09876', nationality: 'Indian',
    interests: 'Animal Welfare', aadhar: 'XXXX-XXXX-7890', pan: 'WXYZA7890B',
    eventsAttended: 7, hoursVolunteered: 28, impactPoints: 2100, rating: 4.5,
    skills: ['Medical Support', 'Teaching', 'Cooking'],
    about: 'Animal lover with experience in shelter management and veterinary support.',
    avatar: 'M', joined: 'Mar 2026',
  },
  {
    id: 6, name: 'Vikram Rao', age: 31, gender: 'Male', city: 'Chennai', state: 'Tamil Nadu',
    email: 'vikram.rao@email.com', phone: '+91 43210 98765', nationality: 'Indian',
    interests: 'Disaster Relief', aadhar: 'XXXX-XXXX-2345', pan: 'CDEFG2345H',
    eventsAttended: 15, hoursVolunteered: 60, impactPoints: 4500, rating: 5.0,
    skills: ['Logistics', 'Crowd Management', 'Construction'],
    about: 'Ex-army officer with extensive disaster management experience.',
    avatar: 'V', joined: 'Nov 2025',
  },
];

const INTERESTS = ['All', 'Environment', 'Healthcare', 'Education', 'Community Service', 'Animal Welfare', 'Disaster Relief'];

const AVATAR_COLORS = ['#fcba03', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#14b8a6'];

const BrowseVolunteers = () => {
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('All');
  const [selected, setSelected]     = useState(null);
  const [recruited, setRecruited]   = useState(new Set());

  const filtered = VOLUNTEERS.filter(v => {
    const matchSearch  = v.name.toLowerCase().includes(search.toLowerCase()) ||
                         v.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter  = filter === 'All' || v.interests === filter;
    return matchSearch && matchFilter;
  });

  const handleRecruit = (id) => {
    setRecruited(prev => new Set([...prev, id]));
  };

  return (
    <div className="bv-wrapper">
      <div className="bv-page-header">
        <h1 className="bv-title">Browse Volunteers</h1>
        <p className="bv-subtitle">Discover and recruit passionate volunteers for your events.</p>

        <div className="bv-controls">
          <input
            type="text"
            className="bv-search"
            placeholder="🔍 Search by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="bv-filters">
            {INTERESTS.map(cat => (
              <button
                key={cat}
                className={`bv-filter-pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bv-count">{filtered.length} volunteer{filtered.length !== 1 ? 's' : ''} found</div>

      <div className="bv-grid">
        {filtered.map((v, i) => (
          <div className="bv-card" key={v.id}>
            <div className="bv-card-top">
              <div className="bv-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                {v.avatar}
              </div>
              <div className="bv-card-info">
                <div className="bv-name">{v.name}</div>
                <div className="bv-meta">{v.city}, {v.state}</div>
                <div className="bv-interest-pill">{v.interests}</div>
              </div>
              <div className="bv-rating">⭐ {v.rating}</div>
            </div>

            <div className="bv-stats">
              <div className="bv-stat">
                <div className="bv-stat-val">{v.eventsAttended}</div>
                <div className="bv-stat-lbl">Events</div>
              </div>
              <div className="bv-stat">
                <div className="bv-stat-val">{v.hoursVolunteered}h</div>
                <div className="bv-stat-lbl">Hours</div>
              </div>
              <div className="bv-stat">
                <div className="bv-stat-val">{v.impactPoints.toLocaleString()}</div>
                <div className="bv-stat-lbl">Points</div>
              </div>
            </div>

            <div className="bv-skills">
              {v.skills.slice(0, 3).map(s => (
                <span className="bv-skill-tag" key={s}>{s}</span>
              ))}
            </div>

            <div className="bv-card-actions">
              <button className="bv-view-btn" onClick={() => setSelected(v)}>
                👁 View Details
              </button>
              <button
                className={`bv-recruit-btn ${recruited.has(v.id) ? 'recruited' : ''}`}
                onClick={() => handleRecruit(v.id)}
                disabled={recruited.has(v.id)}
              >
                {recruited.has(v.id) ? '✅ Recruited' : '+ Recruit'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Popup */}
      {selected && (
        <VolunteerDetailModal
          volunteer={selected}
          color={AVATAR_COLORS[VOLUNTEERS.findIndex(v => v.id === selected.id) % AVATAR_COLORS.length]}
          onClose={() => setSelected(null)}
          recruited={recruited.has(selected.id)}
          onRecruit={() => { handleRecruit(selected.id); }}
        />
      )}
    </div>
  );
};

const VolunteerDetailModal = ({ volunteer: v, color, onClose, recruited, onRecruit }) => (
  <div className="bv-modal-overlay" onClick={onClose}>
    <div className="bv-modal" onClick={e => e.stopPropagation()}>
      <button className="bv-modal-close" onClick={onClose}>✕</button>

      <div className="bv-modal-top">
        <div className="bv-modal-avatar" style={{ background: color }}>{v.avatar}</div>
        <div>
          <div className="bv-modal-name">{v.name}</div>
          <div className="bv-modal-sub">{v.city}, {v.state} · Joined {v.joined}</div>
          <div className="bv-interest-pill" style={{ marginTop: '0.4rem' }}>{v.interests}</div>
        </div>
        <div className="bv-modal-rating">⭐ {v.rating}</div>
      </div>

      <p className="bv-about">{v.about}</p>

      <div className="bv-modal-stats">
        {[
          { label: 'Events Attended', val: v.eventsAttended },
          { label: 'Hours Volunteered', val: `${v.hoursVolunteered}h` },
          { label: 'Impact Points', val: v.impactPoints.toLocaleString() },
        ].map(s => (
          <div className="bv-modal-stat" key={s.label}>
            <div className="bv-modal-stat-val">{s.val}</div>
            <div className="bv-modal-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bv-detail-grid">
        <div className="bv-detail-section">
          <h4>Personal Details</h4>
          <div className="bv-detail-row"><span>Age</span><span>{v.age} years</span></div>
          <div className="bv-detail-row"><span>Gender</span><span>{v.gender}</span></div>
          <div className="bv-detail-row"><span>Nationality</span><span>{v.nationality}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Contact</h4>
          <div className="bv-detail-row"><span>Email</span><span>{v.email}</span></div>
          <div className="bv-detail-row"><span>Phone</span><span>{v.phone}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Identity</h4>
          <div className="bv-detail-row"><span>Aadhar</span><span>{v.aadhar}</span></div>
          <div className="bv-detail-row"><span>PAN</span><span>{v.pan}</span></div>
        </div>
        <div className="bv-detail-section">
          <h4>Skills</h4>
          <div className="bv-skills" style={{ marginTop: '0.5rem' }}>
            {v.skills.map(s => <span className="bv-skill-tag" key={s}>{s}</span>)}
          </div>
        </div>
      </div>

      <div className="bv-modal-actions">
        <button className="bv-view-btn" onClick={onClose}>Close</button>
        <button
          className={`bv-recruit-btn large ${recruited ? 'recruited' : ''}`}
          onClick={onRecruit}
          disabled={recruited}
        >
          {recruited ? '✅ Volunteer Recruited' : '🤝 Recruit Volunteer'}
        </button>
      </div>
    </div>
  </div>
);

export default BrowseVolunteers;

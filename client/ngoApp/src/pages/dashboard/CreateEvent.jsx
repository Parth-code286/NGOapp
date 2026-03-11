import React, { useState } from 'react';
import './CreateEvent.css';

const SKILLS = ['Teaching', 'Medical Support', 'Social Media', 'Logistics', 'Crowd Management', 'Photography', 'Cooking', 'Counseling', 'Construction', 'IT Support'];

const defaultRole = { roleName: '', roleDescription: '', volunteers: '' };

const CreateEvent = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [mode, setMode] = useState('Offline');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [roles, setRoles] = useState([{ ...defaultRole }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addRole = () => setRoles(prev => [...prev, { ...defaultRole }]);
  const removeRole = (i) => setRoles(prev => prev.filter((_, idx) => idx !== i));
  const updateRole = (i, field, value) => {
    setRoles(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Submit to backend
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1200);
  };

  if (success) {
    return (
      <div className="ce-wrapper">
        <div className="ce-success">
          <div className="ce-success-icon">🎉</div>
          <h2>Event Created Successfully!</h2>
          <p>Your event has been published and volunteers can now register.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => setSuccess(false)}>+ Create Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ce-wrapper">
      <div className="ce-page-header">
        <h1 className="ce-title">Create New Event</h1>
        <p className="ce-subtitle">Fill in the details to post a new volunteering opportunity.</p>
      </div>

      <form onSubmit={handleSubmit} className="ce-form">

        {/* ─── Section 1: Basic Info ─────────────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">1</span> Event Information
          </div>
          <div className="ce-grid-2">
            <div className="ce-field col-span-2">
              <label>Event Title / Name *</label>
              <input type="text" className="ce-input" placeholder="e.g. Beach Cleanup Drive 2026" required />
            </div>
            <div className="ce-field">
              <label>Event Category *</label>
              <select className="ce-input" required>
                <option value="">Select Category</option>
                {['Environment','Education','Healthcare','Food Distribution','Disaster Relief','Animal Welfare','Community Service','Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="ce-field">
              <label>Event Mode *</label>
              <select className="ce-input" value={mode} onChange={e => setMode(e.target.value)} required>
                <option>Offline</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div className="ce-field col-span-2">
              <label>Event Description *</label>
              <textarea className="ce-input ce-textarea" rows={4} placeholder="Describe what volunteers will be doing, the purpose of the event, and its impact..." required />
            </div>
          </div>
        </div>

        {/* ─── Section 2: Date & Time ─────────────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">2</span> Date & Time
          </div>
          <div className="ce-grid-4">
            <div className="ce-field">
              <label>Event Date *</label>
              <input type="date" className="ce-input" required />
            </div>
            <div className="ce-field">
              <label>Start Time *</label>
              <input type="time" className="ce-input" required />
            </div>
            <div className="ce-field">
              <label>End Time *</label>
              <input type="time" className="ce-input" required />
            </div>
            <div className="ce-field">
              <label>Registration Deadline *</label>
              <input type="date" className="ce-input" required />
            </div>
          </div>
        </div>

        {/* ─── Section 3: Location ─────────────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">3</span> Location
          </div>
          {(mode === 'Offline' || mode === 'Hybrid') && (
            <div className="ce-grid-2">
              <div className="ce-field col-span-2">
                <label>Venue Name *</label>
                <input type="text" className="ce-input" placeholder="e.g. Juhu Beach, Mumbai" required />
              </div>
              <div className="ce-field col-span-2">
                <label>Address *</label>
                <input type="text" className="ce-input" placeholder="Street address" required />
              </div>
              <div className="ce-field">
                <label>City *</label>
                <input type="text" className="ce-input" placeholder="City" required />
              </div>
              <div className="ce-field">
                <label>State *</label>
                <input type="text" className="ce-input" placeholder="State" required />
              </div>
              <div className="ce-field">
                <label>Pincode *</label>
                <input type="text" className="ce-input" placeholder="e.g. 400049" required />
              </div>
              <div className="ce-field">
                <label>Google Maps Link <span className="ce-optional">(optional)</span></label>
                <input type="url" className="ce-input" placeholder="https://maps.google.com/..." />
              </div>
            </div>
          )}
          {(mode === 'Online' || mode === 'Hybrid') && (
            <div className="ce-grid-2" style={{ marginTop: mode === 'Hybrid' ? '1rem' : '0' }}>
              <div className="ce-field col-span-2">
                <label>Meeting Link (Zoom / Google Meet) *</label>
                <input type="url" className="ce-input" placeholder="https://zoom.us/j/..." required />
              </div>
            </div>
          )}
        </div>

        {/* ─── Section 4: Volunteer Requirements ─── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">4</span> Volunteer Requirements
          </div>
          <div className="ce-grid-2">
            <div className="ce-field">
              <label>Total Volunteers Required *</label>
              <input type="number" min="1" className="ce-input" placeholder="e.g. 50" required />
            </div>
            <div className="ce-field">
              <label>Maximum Volunteers per Registration</label>
              <input type="number" min="1" className="ce-input" placeholder="e.g. 5" />
            </div>
            <div className="ce-field">
              <label>Minimum Age Requirement</label>
              <input type="number" min="10" className="ce-input" placeholder="e.g. 18" />
            </div>
            <div className="ce-field">
              <label>Gender Preference <span className="ce-optional">(optional)</span></label>
              <select className="ce-input">
                <option value="">No Preference</option>
                <option>Male</option>
                <option>Female</option>
                <option>Any</option>
              </select>
            </div>
          </div>
          <div className="ce-field" style={{ marginTop: '1.25rem' }}>
            <label>Skills Required <span className="ce-optional">(optional — select all that apply)</span></label>
            <div className="ce-skill-grid">
              {SKILLS.map(skill => (
                <button
                  type="button"
                  key={skill}
                  className={`ce-skill-pill ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Section 5: Logistics ─────────────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">5</span> Logistics & Perks
          </div>
          <div className="ce-grid-2">
            <div className="ce-field">
              <label>Materials Provided by NGO</label>
              <input type="text" className="ce-input" placeholder="e.g. gloves, bags, food, certificates" />
            </div>
            <div className="ce-field">
              <label>Things Volunteers Must Bring</label>
              <input type="text" className="ce-input" placeholder="e.g. water bottle, ID card" />
            </div>
            <div className="ce-field">
              <label>Volunteering Hours Provided *</label>
              <input type="number" min="0.5" step="0.5" className="ce-input" placeholder="e.g. 4" required />
            </div>
          </div>
          <div className="ce-toggle-row">
            {[
              { label: 'Certificate Provided', name: 'certificate' },
              { label: 'Meals Provided', name: 'meals' },
              { label: 'Travel Allowance', name: 'travel' },
              { label: 'Allow Waitlist', name: 'waitlist' },
            ].map(item => (
              <label className="ce-toggle-label" key={item.name}>
                <span>{item.label}</span>
                <div className="ce-toggle-group">
                  <label className="ce-radio">
                    <input type="radio" name={item.name} value="yes" defaultChecked /> Yes
                  </label>
                  <label className="ce-radio">
                    <input type="radio" name={item.name} value="no" /> No
                  </label>
                </div>
              </label>
            ))}
            <label className="ce-toggle-label">
              <span>Approval Type</span>
              <div className="ce-toggle-group">
                <label className="ce-radio">
                  <input type="radio" name="approval" value="auto" defaultChecked /> Auto
                </label>
                <label className="ce-radio">
                  <input type="radio" name="approval" value="manual" /> Manual
                </label>
              </div>
            </label>
          </div>
        </div>

        {/* ─── Section 6: Media ─────────────────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">6</span> Media
          </div>
          <div className="ce-grid-2">
            <div className="ce-field">
              <label>Event Banner / Poster *</label>
              <input type="file" className="ce-input" accept="image/*" required />
            </div>
            <div className="ce-field">
              <label>Additional Images <span className="ce-optional">(optional — up to 5)</span></label>
              <input type="file" className="ce-input" accept="image/*" multiple />
            </div>
          </div>
        </div>

        {/* ─── Section 7: Organizer Info (pre-filled) ── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">7</span> Organizer Information
            <span className="ce-auto-badge">Auto-filled from your profile</span>
          </div>
          <div className="ce-grid-2">
            <div className="ce-field">
              <label>NGO Name</label>
              <input type="text" className="ce-input ce-readonly" value={user.name || 'Your NGO'} readOnly />
            </div>
            <div className="ce-field">
              <label>Organizer Contact Person</label>
              <input type="text" className="ce-input" placeholder="Name of coordinator" />
            </div>
            <div className="ce-field">
              <label>Contact Phone Number</label>
              <input type="tel" className="ce-input" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="ce-field">
              <label>Contact Email</label>
              <input type="email" className="ce-input" value={user.email || ''} placeholder="contact@ngo.org" />
            </div>
          </div>
        </div>

        {/* ─── Section 8: Volunteer Roles ───────────── */}
        <div className="ce-section">
          <div className="ce-section-label">
            <span className="ce-section-num">8</span> Volunteer Roles Required
          </div>
          <div className="ce-roles-list">
            {roles.map((role, i) => (
              <div className="ce-role-card" key={i}>
                <div className="ce-role-header">
                  <span className="ce-role-num">Role {i + 1}</span>
                  {roles.length > 1 && (
                    <button type="button" className="ce-remove-role" onClick={() => removeRole(i)}>✕ Remove</button>
                  )}
                </div>
                <div className="ce-grid-2">
                  <div className="ce-field">
                    <label>Role Name *</label>
                    <input
                      type="text"
                      className="ce-input"
                      placeholder="e.g. Team Leader"
                      value={role.roleName}
                      onChange={e => updateRole(i, 'roleName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="ce-field">
                    <label>Volunteers Required *</label>
                    <input
                      type="number"
                      min="1"
                      className="ce-input"
                      placeholder="e.g. 10"
                      value={role.volunteers}
                      onChange={e => updateRole(i, 'volunteers', e.target.value)}
                      required
                    />
                  </div>
                  <div className="ce-field col-span-2">
                    <label>Role Description</label>
                    <textarea
                      className="ce-input ce-textarea"
                      rows={2}
                      placeholder="Describe the responsibilities for this role..."
                      value={role.roleDescription}
                      onChange={e => updateRole(i, 'roleDescription', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="ce-add-role-btn" onClick={addRole}>
              + Add Another Role
            </button>
          </div>
        </div>

        {/* ─── Submit ─────────────────────────────────── */}
        <div className="ce-submit-row">
          <button type="button" className="btn ce-draft-btn">Save as Draft</button>
          <button type="submit" className="btn btn-primary ce-submit-btn" disabled={loading}>
            {loading ? 'Publishing...' : '🚀 Publish Event'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateEvent;

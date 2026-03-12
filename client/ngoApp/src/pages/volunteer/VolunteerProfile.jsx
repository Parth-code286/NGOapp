import React, { useState, useEffect } from 'react';
import '../dashboard/Profile.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const VolunteerProfile = () => {
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // password
  const [pwSection,  setPwSection]  = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState('');

  // ── Fetch profile ──
  useEffect(() => {
    if (!user.id) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/api/volunteer/${user.id}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');
        setProfile(data.volunteer);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  // ── Save profile ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.target;
    const payload = {
      name:        f.name.value,
      dob:         f.dob.value || null,
      gender:      f.gender.value,
      nationality: f.nationality.value,
      email:       f.email.value,
      phone:       f.phone.value,
      city:        f.city.value,
      state:       f.state.value,
      country:     f.country.value,
      pincode:     f.pincode.value,
      aadhar:      f.aadhar.value,
      pan:         f.pan.value,
      interests:   f.interests.value,
    };
    try {
      const res  = await fetch(`${API_BASE}/api/volunteer/${user.id}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setProfile(data.volunteer);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      const updatedUser = { ...user, name: payload.name, email: payload.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ──
  const handlePassword = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    const f = e.target;
    try {
      const res = await fetch(`${API_BASE}/api/volunteer/${user.id}/password`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          currentPassword: f.currentPassword.value,
          newPassword:     f.newPassword.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPwSuccess('Password changed successfully!');
      f.reset();
      setTimeout(() => { setPwSuccess(''); setPwSection(false); }, 3000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  // ── Loading / Error states ──
  if (loading) return (
    <div className="pf-wrapper">
      <div className="pf-loading"><div className="pf-spinner" /><p>Loading profile…</p></div>
    </div>
  );

  if (!profile) return (
    <div className="pf-wrapper">
      <div className="pf-error">⚠️ {error || 'Profile not found.'}</div>
    </div>
  );

  const p = profile;
  const val = (v) => v || '—';

  // ── Editing View ──
  if (editing) {
    return (
      <div className="pf-wrapper">
        <div className="pf-header">
          <h1 className="pf-title">Edit Profile</h1>
          <p className="pf-subtitle">Update your volunteer details.</p>
        </div>

        {error && <div className="pf-error">⚠️ {error}</div>}

        <form className="pf-form" onSubmit={handleSave}>
          <div className="pf-card">
            <div className="pf-card-title">👤 Personal Details</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Full Name</label>
                <input name="name" className="pf-input" defaultValue={p.name} required />
              </div>
              <div className="pf-field">
                <label>Date of Birth</label>
                <input name="dob" type="date" className="pf-input" defaultValue={p.dob} />
              </div>
              <div className="pf-field">
                <label>Gender</label>
                <select name="gender" className="pf-input" defaultValue={p.gender || ''}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="pf-field">
                <label>Nationality</label>
                <input name="nationality" className="pf-input" defaultValue={p.nationality} />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">📞 Contact Information</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Email</label>
                <input name="email" type="email" className="pf-input" defaultValue={p.email} required />
              </div>
              <div className="pf-field">
                <label>Phone</label>
                <input name="phone" className="pf-input" defaultValue={p.phone} />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">📍 Address</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>City</label>
                <input name="city" className="pf-input" defaultValue={p.city} />
              </div>
              <div className="pf-field">
                <label>State</label>
                <input name="state" className="pf-input" defaultValue={p.state} />
              </div>
              <div className="pf-field">
                <label>Country</label>
                <input name="country" className="pf-input" defaultValue={p.country} />
              </div>
              <div className="pf-field">
                <label>Pincode</label>
                <input name="pincode" className="pf-input" defaultValue={p.pincode} />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">📄 Identity & Interests</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Aadhar Number</label>
                <input name="aadhar" className="pf-input" defaultValue={p.aadhar} />
              </div>
              <div className="pf-field">
                <label>PAN Number</label>
                <input name="pan" className="pf-input" defaultValue={p.pan} />
              </div>
              <div className="pf-field full">
                <label>Interests</label>
                <input name="interests" className="pf-input" defaultValue={p.interests} placeholder="e.g. health, education, environment" />
              </div>
            </div>
          </div>

          <div className="pf-form-actions">
            <button type="button" className="pf-btn" onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className="pf-btn primary" disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Read-Only View ──
  return (
    <div className="pf-wrapper">
      <div className="pf-header">
        <h1 className="pf-title">My Profile</h1>
        <p className="pf-subtitle">View and manage your volunteer profile.</p>
      </div>

      {success && <div className="pf-success">✅ {success}</div>}
      {error && <div className="pf-error">⚠️ {error}</div>}

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-avatar">{(p.name || 'V')[0].toUpperCase()}</div>
        <div className="pf-hero-info">
          <h2>{p.name}</h2>
          <div className="pf-hero-meta">
            <span>📧 {p.email}</span>
            {p.city && <span>📍 {p.city}, {p.state}</span>}
            <span>⭐ Level {p.level || 1} · {p.points || 0} pts</span>
          </div>
        </div>
        <div className="pf-hero-actions">
          <button className="pf-btn primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
        </div>
      </div>

      {/* Personal Details */}
      <div className="pf-card">
        <div className="pf-card-title">👤 Personal Details</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Full Name</span>
            <span className="pf-info-value">{val(p.name)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Date of Birth</span>
            <span className="pf-info-value">{p.dob ? new Date(p.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Gender</span>
            <span className="pf-info-value">{p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '—'}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Nationality</span>
            <span className="pf-info-value">{val(p.nationality)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Member Since</span>
            <span className="pf-info-value">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="pf-card">
        <div className="pf-card-title">📞 Contact Information</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Email</span>
            <span className="pf-info-value">{val(p.email)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Phone</span>
            <span className="pf-info-value">{val(p.phone)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="pf-card">
        <div className="pf-card-title">📍 Address</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">City</span>
            <span className="pf-info-value">{val(p.city)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">State</span>
            <span className="pf-info-value">{val(p.state)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Country</span>
            <span className="pf-info-value">{val(p.country)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Pincode</span>
            <span className="pf-info-value">{val(p.pincode)}</span>
          </div>
        </div>
      </div>

      {/* Identity & Interests */}
      <div className="pf-card">
        <div className="pf-card-title">📄 Identity & Interests</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Aadhar</span>
            <span className="pf-info-value">{val(p.aadhar)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">PAN</span>
            <span className="pf-info-value">{val(p.pan)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Interests</span>
            <span className="pf-info-value">{val(p.interests)}</span>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="pf-card">
        <div className="pf-card-title">🏆 Gamification Stats</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Points</span>
            <span className="pf-info-value">{p.points || 0}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Level</span>
            <span className="pf-info-value">{p.level || 1}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Streak</span>
            <span className="pf-info-value">{p.streak || 0} days</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Events Attended</span>
            <span className="pf-info-value">{p.events_attended || 0}</span>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="pf-card">
        <div className="pf-card-title">🔒 Security</div>
        {!pwSection ? (
          <button className="pf-btn" onClick={() => setPwSection(true)}>Change Password</button>
        ) : (
          <>
            {pwError && <div className="pf-error">⚠️ {pwError}</div>}
            {pwSuccess && <div className="pf-success">✅ {pwSuccess}</div>}
            <form onSubmit={handlePassword}>
              <div className="pf-pw-grid">
                <div className="pf-field">
                  <label>Current Password</label>
                  <input name="currentPassword" type="password" className="pf-input" required />
                </div>
                <div className="pf-field">
                  <label>New Password</label>
                  <input name="newPassword" type="password" className="pf-input" minLength={8} required />
                </div>
                <div className="pf-field">
                  <label>&nbsp;</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="pf-btn primary" disabled={pwLoading}>
                      {pwLoading ? 'Saving…' : 'Update Password'}
                    </button>
                    <button type="button" className="pf-btn" onClick={() => { setPwSection(false); setPwError(''); }}>Cancel</button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerProfile;

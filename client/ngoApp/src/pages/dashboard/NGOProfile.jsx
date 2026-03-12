import React, { useState, useEffect } from 'react';
import './Profile.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}`;

const NGOProfile = () => {
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
        const res  = await fetch(`${API_BASE}/api/ngo/${user.id}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');
        setProfile(data.ngo);
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
      name:              f.name.value,
      type:              f.type.value,
      officialEmail:     f.official_email.value,
      phone:             f.phone.value,
      website:           f.website.value,
      address:           f.address.value,
      city:              f.city.value,
      state:             f.state.value,
      pincode:           f.pincode.value,
      authPersonName:    f.auth_person_name.value,
      authPersonMobile:  f.auth_person_mobile.value,
      authPersonEmail:   f.auth_person_email.value,
    };
    try {
      const res  = await fetch(`${API_BASE}/api/ngo/${user.id}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setProfile(data.ngo);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      // update localStorage name
      const updatedUser = { ...user, name: payload.name };
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
      const res = await fetch(`${API_BASE}/api/ngo/${user.id}/password`, {
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
          <p className="pf-subtitle">Update your NGO's details.</p>
        </div>

        {error && <div className="pf-error">⚠️ {error}</div>}

        <form className="pf-form" onSubmit={handleSave}>
          <div className="pf-card">
            <div className="pf-card-title">🏢 Organisation Details</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Organisation Name</label>
                <input name="name" className="pf-input" defaultValue={p.name} required />
              </div>
              <div className="pf-field">
                <label>Type</label>
                <select name="type" className="pf-input" defaultValue={p.type}>
                  <option value="trust">Trust</option>
                  <option value="society">Society</option>
                  <option value="section8">Section 8 Company</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="pf-field">
                <label>Registration No</label>
                <input name="registration_no" className="pf-input" defaultValue={p.registration_no} readOnly />
              </div>
              <div className="pf-field">
                <label>PAN</label>
                <input name="pan" className="pf-input" defaultValue={p.pan} readOnly />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">📞 Contact Information</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Official Email</label>
                <input name="official_email" type="email" className="pf-input" defaultValue={p.official_email} required />
              </div>
              <div className="pf-field">
                <label>Phone</label>
                <input name="phone" className="pf-input" defaultValue={p.phone} />
              </div>
              <div className="pf-field full">
                <label>Website</label>
                <input name="website" type="url" className="pf-input" defaultValue={p.website} />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">📍 Address</div>
            <div className="pf-form-grid">
              <div className="pf-field full">
                <label>Address</label>
                <input name="address" className="pf-input" defaultValue={p.address} />
              </div>
              <div className="pf-field">
                <label>City</label>
                <input name="city" className="pf-input" defaultValue={p.city} />
              </div>
              <div className="pf-field">
                <label>State</label>
                <input name="state" className="pf-input" defaultValue={p.state} />
              </div>
              <div className="pf-field">
                <label>Pincode</label>
                <input name="pincode" className="pf-input" defaultValue={p.pincode} />
              </div>
            </div>
          </div>

          <div className="pf-card">
            <div className="pf-card-title">👤 Authorized Person</div>
            <div className="pf-form-grid">
              <div className="pf-field">
                <label>Name</label>
                <input name="auth_person_name" className="pf-input" defaultValue={p.auth_person_name} />
              </div>
              <div className="pf-field">
                <label>Mobile</label>
                <input name="auth_person_mobile" className="pf-input" defaultValue={p.auth_person_mobile} />
              </div>
              <div className="pf-field full">
                <label>Email</label>
                <input name="auth_person_email" type="email" className="pf-input" defaultValue={p.auth_person_email} />
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
        <p className="pf-subtitle">View and manage your NGO profile details.</p>
      </div>

      {success && <div className="pf-success">✅ {success}</div>}
      {error && <div className="pf-error">⚠️ {error}</div>}

      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-avatar">{(p.name || 'N')[0].toUpperCase()}</div>
        <div className="pf-hero-info">
          <h2>{p.name}</h2>
          <div className="pf-hero-meta">
            <span>🏢 {p.type?.charAt(0).toUpperCase() + p.type?.slice(1) || 'NGO'}</span>
            <span>📧 {p.official_email}</span>
            {p.city && <span>📍 {p.city}, {p.state}</span>}
          </div>
        </div>
        <div className="pf-hero-actions">
          <button className="pf-btn primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
        </div>
      </div>

      {/* Organisation Details */}
      <div className="pf-card">
        <div className="pf-card-title">🏢 Organisation Details</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Organisation Name</span>
            <span className="pf-info-value">{val(p.name)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Type</span>
            <span className="pf-info-value">{val(p.type)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Registration No</span>
            <span className="pf-info-value">{val(p.registration_no)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Registration Date</span>
            <span className="pf-info-value">{p.registration_date ? new Date(p.registration_date).toLocaleDateString('en-IN') : '—'}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">PAN</span>
            <span className="pf-info-value">{val(p.pan)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">TAN</span>
            <span className="pf-info-value">{val(p.tan)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">12A Registration</span>
            <span className="pf-info-value">{val(p.reg_12a)}</span>
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
            <span className="pf-info-label">Official Email</span>
            <span className="pf-info-value">{val(p.official_email)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Phone</span>
            <span className="pf-info-value">{val(p.phone)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Website</span>
            <span className="pf-info-value">{p.website ? <a href={p.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{p.website}</a> : '—'}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="pf-card">
        <div className="pf-card-title">📍 Address</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Address</span>
            <span className="pf-info-value">{val(p.address)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">City</span>
            <span className="pf-info-value">{val(p.city)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">State</span>
            <span className="pf-info-value">{val(p.state)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Pincode</span>
            <span className="pf-info-value">{val(p.pincode)}</span>
          </div>
        </div>
      </div>

      {/* Authorized Person */}
      <div className="pf-card">
        <div className="pf-card-title">👤 Authorized Person</div>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Name</span>
            <span className="pf-info-value">{val(p.auth_person_name)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Mobile</span>
            <span className="pf-info-value">{val(p.auth_person_mobile)}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Email</span>
            <span className="pf-info-value">{val(p.auth_person_email)}</span>
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

export default NGOProfile;

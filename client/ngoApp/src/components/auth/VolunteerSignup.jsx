import React, { useState } from 'react';
import './Auth.css';

const API_BASE = 'http://localhost:5053/api';

const VolunteerSignup = ({ onBack, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.target;
    const payload = {
      fullName: form.fullName.value,
      dob: form.dob.value,
      gender: form.gender.value,
      nationality: form.nationality.value,
      email: form.email.value,
      phone: form.phone.value,
      city: form.city.value,
      state: form.state.value,
      country: form.country.value,
      pincode: form.pincode.value,
      aadhar: form.aadhar.value,
      pan: form.pan.value,
      interests: form.interests.value,
      password: form['v-password'].value,
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Save token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`Welcome, ${data.user.name}! Your volunteer account has been created.`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button className="text-link" style={{ textAlign: 'left', marginBottom: '1rem' }} onClick={onBack}>
        &larr; Back to roles
      </button>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form form-grid">
        <h3 className="form-section-header">Personal Information</h3>
        
        <div className="form-group col-span-2">
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" className="form-input" placeholder="Enter your full name" required />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input type="date" id="dob" name="dob" className="form-input" required />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" className="form-input" required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nationality">Nationality</label>
          <input type="text" id="nationality" name="nationality" className="form-input" placeholder="e.g. Indian" required />
        </div>

        <div className="form-group">
          <label htmlFor="profilePhoto">Profile Photo</label>
          <input type="file" id="profilePhoto" name="profilePhoto" className="form-input" accept="image/*" />
        </div>

        <h3 className="form-section-header">Contact & Location</h3>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" className="form-input" placeholder="your.email@example.com" required />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" className="form-input" placeholder="e.g. +91 9876543210" required />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="city">City</label>
          <input type="text" id="city" name="city" className="form-input" placeholder="Enter your city" required />
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <input type="text" id="state" name="state" className="form-input" placeholder="Enter your state" required />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input type="text" id="country" name="country" className="form-input" placeholder="Enter your country" required />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="pincode">Pincode</label>
          <input type="text" id="pincode" name="pincode" className="form-input" placeholder="e.g. 110001" required />
        </div>

        <h3 className="form-section-header">Identity Details</h3>

        <div className="form-group">
          <label htmlFor="aadhar">Aadhar Number</label>
          <input type="text" id="aadhar" name="aadhar" className="form-input" placeholder="12-digit Aadhar number" />
        </div>

        <div className="form-group">
          <label htmlFor="pan">PAN Number</label>
          <input type="text" id="pan" name="pan" className="form-input" placeholder="10-character PAN" />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="idProof">ID Proof Upload (Aadhar/PAN/Passport)</label>
          <input type="file" id="idProof" name="idProof" className="form-input" accept="image/*,.pdf" />
        </div>

        <h3 className="form-section-header">Interests & Account</h3>

        <div className="form-group col-span-2">
          <label htmlFor="interests">Area of Interest</label>
          <select id="interests" name="interests" className="form-input" required>
            <option value="">Select Primary Interest</option>
            <option value="education">Education & Tutoring</option>
            <option value="environment">Environmental Conservation</option>
            <option value="health">Healthcare & Medical</option>
            <option value="animal">Animal Welfare</option>
            <option value="community">Community Development</option>
            <option value="disaster">Disaster Relief</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="v-password">Create Password</label>
          <input type="password" id="v-password" name="v-password" className="form-input" placeholder="Minimum 8 characters" minLength={8} required />
        </div>

        <button type="submit" className="btn btn-primary w-full submit-btn col-span-2" disabled={loading}>
          {loading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
};

export default VolunteerSignup;

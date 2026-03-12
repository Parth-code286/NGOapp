import React, { useState } from 'react';
import './Auth.css';

const API_BASE = 'http://localhost:5053/api';

const NGOSignup = ({ onBack, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const payload = {
      ngoName: form.ngoName.value,
      ngoType: form.ngoType.value,
      regDate: form.regDate.value,
      regNo: form.regNo.value,
      pan: form.ngopan.value,
      tan: form.ngotan.value,
      reg12a: form.reg12a.value,
      officialEmail: form.officialEmail.value,
      ngoPhone: form.ngoPhone.value,
      website: form.website.value,
      ngoAddress: form.ngoAddress.value,
      ngoCity: form.ngoCity.value,
      ngoState: form.ngoState.value,
      ngoPincode: form.ngoPincode.value,
      authName: form.authName.value,
      authMobile: form.authMobile.value,
      authEmail: form.authEmail.value,
      password: form['ngo-password'].value,
    };
    try {
      const res = await fetch(`${API_BASE}/auth/register/ngo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
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
        <h3 className="form-section-header">Organization Details</h3>
        
        <div className="form-group col-span-2">
          <label htmlFor="ngoName">Name of NGO</label>
          <input type="text" id="ngoName" name="ngoName" className="form-input" placeholder="Enter official organization name" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngoType">NGO Type</label>
          <select id="ngoType" name="ngoType" className="form-input" required>
            <option value="">Select Type</option>
            <option value="trust">Trust</option>
            <option value="society">Society</option>
            <option value="section8">Section 8 Company</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="regDate">Date of Registration</label>
          <input type="date" id="regDate" name="regDate" className="form-input" required />
        </div>

        <div className="form-group">
          <label htmlFor="regNo">Govt. Issue Reg. No.</label>
          <input type="text" id="regNo" name="regNo" className="form-input" placeholder="Enter registration number" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngoLogo">Upload Logo</label>
          <input type="file" id="ngoLogo" className="form-input" accept="image/*" />
        </div>

        <h3 className="form-section-header">Tax & Compliance Info</h3>

        <div className="form-group">
          <label htmlFor="ngopan">PAN Number</label>
          <input type="text" id="ngopan" name="ngopan" className="form-input" placeholder="Organization PAN" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngotan">TAN Number</label>
          <input type="text" id="ngotan" name="ngotan" className="form-input" placeholder="Organization TAN" />
        </div>

        <div className="form-group">
          <label htmlFor="reg12a">12A Registration No. (Optional)</label>
          <input type="text" id="reg12a" name="reg12a" className="form-input" placeholder="If applicable" />
        </div>

        <div className="form-group">
          <label htmlFor="cert80g">80G Verification Document (Optional)</label>
          <input type="file" id="cert80g" className="form-input" accept="application/pdf" />
        </div>

        <h3 className="form-section-header">Contact Information</h3>

        <div className="form-group col-span-2">
          <label htmlFor="officialEmail">Official Email Update</label>
          <input type="email" id="officialEmail" name="officialEmail" className="form-input" placeholder="contact@ngo.org" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngoPhone">Official Phone Number</label>
          <input type="tel" id="ngoPhone" name="ngoPhone" className="form-input" placeholder="e.g. +91 9876543210" required />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website (Optional)</label>
          <input type="url" id="website" name="website" className="form-input" placeholder="https://www.ngo.org" />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="ngoAddress">Registered Address</label>
          <input type="text" id="ngoAddress" name="ngoAddress" className="form-input" placeholder="Street Address" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngoCity">City</label>
          <input type="text" id="ngoCity" name="ngoCity" className="form-input" placeholder="City" required />
        </div>

        <div className="form-group">
          <label htmlFor="ngoState">State</label>
          <input type="text" id="ngoState" name="ngoState" className="form-input" placeholder="State" required />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="ngoPincode">Pincode</label>
          <input type="text" id="ngoPincode" name="ngoPincode" className="form-input" placeholder="e.g. 110001" required />
        </div>

        <h3 className="form-section-header">Authorized Person Details</h3>

        <div className="form-group col-span-2">
          <label htmlFor="authName">Full Name</label>
          <input type="text" id="authName" name="authName" className="form-input" placeholder="Name of primary contact" required />
        </div>

        <div className="form-group">
          <label htmlFor="authMobile">Mobile Number</label>
          <input type="tel" id="authMobile" name="authMobile" className="form-input" placeholder="Personal/Direct mobile" required />
        </div>

        <div className="form-group">
          <label htmlFor="authEmail">Email ID</label>
          <input type="email" id="authEmail" name="authEmail" className="form-input" placeholder="Direct email" required />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="authIdProof">ID Proof Upload (Aadhar/PAN)</label>
          <input type="file" id="authIdProof" className="form-input" accept="image/*,.pdf" required />
        </div>

        <div className="form-group col-span-2">
          <label htmlFor="ngo-password">Create Password</label>
          <input type="password" id="ngo-password" name="ngo-password" className="form-input" placeholder="Minimum 8 characters" minLength={8} required />
        </div>

        <button type="submit" className="btn btn-primary w-full submit-btn col-span-2" disabled={loading}>
          {loading ? 'Registering...' : 'Register NGO'}
        </button>
      </form>
    </div>
  );
};

export default NGOSignup;

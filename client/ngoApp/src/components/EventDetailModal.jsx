import React from 'react';
import './EventDetailModal.css';

const EventDetailModal = ({ event, onClose, actionButton, actionDisabled }) => {
  if (!event) return null;

  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const isExpired = deadline && deadline < new Date();
  
  return (
    <div className="edm-overlay" onClick={onClose}>
      <div className="edm-modal" onClick={e => e.stopPropagation()}>
        <button className="edm-close" onClick={onClose}>✕</button>

        <div className="edm-header">
          <div className={`edm-mode ${event.mode?.toLowerCase()}`}>{event.mode}</div>
          <div className="edm-category">{event.category}</div>
          <h2 className="edm-title">{event.title}</h2>
          <div className="edm-ngo">🏢 {event.ngo_name || 'Organization'}</div>
        </div>

        <div className="edm-body">
          <p className="edm-description">{event.description}</p>

          <div className="edm-grid">
            <div className="edm-section">
              <h3>📅 When & Where</h3>
              <div className="edm-row"><span>Date</span><span>{event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
              <div className="edm-row"><span>Time</span><span>{event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}</span></div>
              <div className="edm-row"><span>Location</span><span>{event.mode === 'Online' ? 'Virtual (Link provided after registration)' : `${event.venue_name || ''}, ${event.address || ''}, ${event.city || ''}`}</span></div>
            </div>

            <div className="edm-section">
              <h3>👥 Volunteer Requirements</h3>
              <div className="edm-row"><span>Volunteers Needed</span><span>{event.total_volunteers || 'Flexible'}</span></div>
              <div className="edm-row"><span>Min. Age</span><span>{event.min_age || 18}+ years</span></div>
              <div className="edm-row"><span>Gender Pref.</span><span>{event.gender_preference || 'No Preference'}</span></div>
              {event.skills_required && event.skills_required.length > 0 && (
                <div className="edm-skills">
                  {event.skills_required.map(s => <span key={s} className="edm-skill-tag">{s}</span>)}
                </div>
              )}
            </div>

            <div className="edm-section">
              <h3>🎒 Logistics & Perks</h3>
              <div className="edm-row"><span>Hours Provided</span><span>{event.volunteering_hours}h</span></div>
              <div className="edm-row"><span>Things to bring</span><span>{event.things_to_bring || 'Nothing specific'}</span></div>
              <div className="edm-perks">
                {event.certificate_provided && <span className="edm-perk-tag">🎓 Certificate</span>}
                {event.meals_provided       && <span className="edm-perk-tag">🍽 Meals</span>}
                {event.travel_allowance     && <span className="edm-perk-tag">🚌 Travel</span>}
              </div>
            </div>

            <div className="edm-section">
              <h3>📞 Contact</h3>
              <div className="edm-row"><span>Coordinator</span><span>{event.contact_person || 'N/A'}</span></div>
              <div className="edm-row"><span>Phone</span><span>{event.contact_phone || 'N/A'}</span></div>
              <div className="edm-row"><span>Email</span><span>{event.contact_email || 'N/A'}</span></div>
            </div>
          </div>
        </div>

        <div className="edm-footer">
          <div className="edm-slots">
            {deadline && (
              <span className={isExpired ? 'deadline expired' : 'deadline'}>
                {isExpired ? '⛔ Registration Closed' : `⏳ Register by ${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`}
              </span>
            )}
          </div>
          <div className="edm-actions">
            <button className="edm-btn-secondary" onClick={onClose}>Close</button>
            {actionButton && React.cloneElement(actionButton, { className: `edm-btn-primary ${actionButton.props.className || ''}` })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;

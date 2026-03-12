import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleGoBack = () => {
    if (user.role === 'ngo') navigate('/dashboard/ngo');
    else if (user.role === 'volunteer') navigate('/dashboard/volunteer');
    else navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '7rem', lineHeight: 1, marginBottom: '1.5rem' }}>🔍</div>
      <h1 style={{ fontSize: '6rem', fontWeight: 800, margin: 0, color: '#0d9488', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '1rem 0 0.5rem 0' }}>Page Not Found</h2>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleGoBack}
          style={{
            background: '#0d9488',
            color: 'white',
            border: 'none',
            padding: '0.85rem 2rem',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {user.id ? '← Back to Dashboard' : '← Go Home'}
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            padding: '0.85rem 2rem',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;

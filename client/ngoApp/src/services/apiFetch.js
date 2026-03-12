/**
 * apiFetch — a thin wrapper around fetch() that:
 * 1. Automatically attaches the Bearer token from localStorage
 * 2. Handles 401 responses globally by clearing the session and redirecting to /login
 * 3. Returns the parsed JSON (or throws on error)
 *
 * Usage: apiFetch('/api/payments/wallet-info')
 *        apiFetch('/api/auth/update', { method: 'PUT', body: JSON.stringify(data) })
 */

const API_BASE = 'http://localhost:5053';

export const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    // Global 401 handler — token expired or invalid
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login without losing the current page reference
        const currentPath = window.location.pathname;
        window.location.href = `/login?expired=true&redirectTo=${encodeURIComponent(currentPath)}`;
        return; // stop further execution
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
};

//
// FILE: Frontend/src/services/startupProfileApi.js (Modified)
//
// I have added the new 'getPublicProfile' function at the end.
//

import axios from 'axios';
import { getToken } from '../auth.js';
import { notifySessionExpired } from '../utils/session.js';

let API_URL;

if (import.meta.env.VITE_API_URL) {
  API_URL = import.meta.env.VITE_API_URL;
} else if (window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001";
} else {
  API_URL = "http://10.123.23.187:5001";
}

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            notifySessionExpired('api-401');
        }
        return Promise.reject(err);
    }
);

function authHeader() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProfile() {
    const { data } = await api.get('/api/startup-profile', { headers: authHeader() });
    return data; // { profile, user }
}

export async function saveProfile(payload) {
    const { data } = await api.post('/api/startup-profile', payload, { headers: authHeader() });
    return data; // { message, profile }
}

// Fetch all startups for investor dashboard, including team counts
export async function getAllStartups() {
    const { data } = await api.get('/api/startup-profile/all', { headers: authHeader() });
    return data; // { startups: [...] }
}

//
// --- NEW FUNCTION ADDED BELOW ---
//

/**
 * Fetches the complete public profile for a single startup by its username.
 * (Used by investors to view a startup's page)
 * @param {string} username - The username of the startup to fetch.
 */
export async function getPublicProfile(username) {
    if (!username) {
        throw new Error('Username is required to fetch public profile.');
    }
    const { data } = await api.get(`/api/startup-profile/${username}`, { headers: authHeader() });
    return data; // Returns { profile, team, dockFiles }
}

// Public, no-auth variant (used by public pages to fetch logo by username)
export async function getPublicProfileNoAuth(username) {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const res = await fetch(`${base}/api/public/startup-profile/${encodeURIComponent(username)}`);
    if (!res.ok) {
        const msg = await res.text().catch(() => 'Failed to fetch public profile');
        throw new Error(msg || `Failed to fetch public profile (${res.status})`);
    }
    return res.json();
}
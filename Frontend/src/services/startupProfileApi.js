import axios from 'axios';
import { getToken } from '../auth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

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

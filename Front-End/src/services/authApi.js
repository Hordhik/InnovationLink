import axios from 'axios';
import { getToken } from '../auth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

export async function login({ identifier, password, userType }) {
    const id = (identifier || '').trim();
    const payload = id.includes('@')
        ? { email: id, password, userType }
        : { identifier: id, password, userType };

    const { data } = await api.post('/api/auth/login', payload);
    return data; // { token, user, redirectPath }
}

export async function signup({ userType, name, email, password, phone }) {
    // Backend expects `username`; map UI `name` to `username` for consistency
    const payload = { userType, username: name, email, phone, password };
    // Backend route is /register; also a /signup alias is added for compatibility
    const { data } = await api.post('/api/auth/register', payload);
    return data; // { message, user }
}

// Retrieve the active session using the JWT stored in localStorage
export async function getSession() {
    const token = getToken();
    if (!token) {
        const error = new Error('No auth token');
        error.status = 401;
        throw error;
    }
    const { data } = await api.get('/api/auth/session', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data; // { authenticated: true, user }
}
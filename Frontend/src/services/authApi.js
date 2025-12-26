import axios from 'axios';
import { getToken, setAuth } from '../auth.js';
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
    timeout: 10000,
});

// If backend rejects token (expired/invalid), force logout + redirect.
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            notifySessionExpired('api-401');
        }
        return Promise.reject(err);
    }
);

export async function login({ identifier, password, userType }) {
    const id = (identifier || '').trim();
    const payload = id.includes('@')
        ? { email: id, password, userType }
        : { identifier: id, password, userType };

    const { data } = await api.post('/api/auth/login', payload);
    return data; // { token, user, redirectPath }
}

export async function signup({ userType, name, email, password, phone }) {
    // Backwards compatible: allow old callers to pass `name` as username
    const payload = {
        userType,
        username: name,
        email,
        phone,
        password,
    };
    // Backend route is /register; also a /signup alias is added for compatibility
    const { data } = await api.post('/api/auth/register', payload);
    return data; // { message, user }
}

// Public: check username availability and/or get an available suggestion
export async function getUsernameAvailability({ username, name }) {
    const params = new URLSearchParams();
    if (username) params.set('username', username);
    if (name) params.set('name', name);
    const { data } = await api.get(`/api/auth/username-availability?${params.toString()}`);
    return data; // { username, available, valid, suggestion }
}

// New signup signature (preferred)
export async function signupV2({ userType, username, email, password, phone, companyName, fullName }) {
    const payload = {
        userType,
        username,
        email,
        phone,
        password,
        companyName,
        fullName,
    };
    const { data } = await api.post('/api/auth/register', payload);
    return data;
}

// Retrieve the active session using the JWT stored in localStorage
export async function getSession() {
    const token = getToken();
    if (!token) {
        // Return null instead of throwing an error when no token exists
        return null;
    }

    try {
        const { data } = await api.get('/api/auth/session', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Refresh stored user for consistent display across components
        if (data?.user) {
            try { setAuth({ user: data.user }); } catch {"Error in Auth"}
        }
        return data; // { authenticated: true, user }
    } catch (error) {
        // If the token is invalid or expired, clear it and return null
        if (error.response?.status === 401) {
            notifySessionExpired('api-401');
            return null;
        }
        throw error;
    }
}
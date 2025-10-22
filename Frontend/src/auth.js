// Lightweight auth helpers for storing and retrieving auth data

const TOKEN_KEY = 'il_token';
const USER_KEY = 'il_user';
const ROLE_KEY = 'il_role';

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getStoredRole() {
    try {
        return localStorage.getItem(ROLE_KEY);
    } catch {
        return null;
    }
}

export function clearAuth() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ROLE_KEY);
    } catch {
        // ignore
    }
}

export function setAuth({ token, user, role }) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (role) localStorage.setItem(ROLE_KEY, role);
    } catch {
        // ignore
    }
}

// Lightweight auth helpers for storing and retrieving auth data

const TOKEN_KEY = 'il_token';
const USER_KEY = 'il_user';
const ROLE_KEY = 'il_role';

function emitAuthChanged() {
    try {
        window.dispatchEvent(new Event('il:auth-changed'));
    } catch {
        // ignore
    }
}

function decodeJwtPayload(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        // base64url decode
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '==='.slice((b64.length + 3) % 4);
        const json = atob(padded);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function getTokenExpiryMs(token = getToken()) {
    const payload = decodeJwtPayload(token);
    const expSeconds = payload?.exp;
    if (!expSeconds || typeof expSeconds !== 'number') return null;
    return expSeconds * 1000;
}

export function isTokenExpired(token = getToken(), skewMs = 0) {
    const expMs = getTokenExpiryMs(token);
    if (!expMs) return false;
    return Date.now() + Math.max(0, Number(skewMs) || 0) >= expMs;
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
    emitAuthChanged();
}

export function setAuth({ token, user, role }) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (role) localStorage.setItem(ROLE_KEY, role);
    } catch {
        // ignore
    }
    emitAuthChanged();
}

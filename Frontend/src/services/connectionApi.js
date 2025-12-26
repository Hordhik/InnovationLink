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
    timeout: 10000,
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

// Helper to attach token
const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Connections ---

export async function sendConnectionRequest(targetUserId) {
    const { data } = await api.post('/api/connections/request',
        { targetUserId },
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function cancelConnectionRequest(targetUserId) {
    const { data } = await api.post('/api/connections/cancel',
        { targetUserId },
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function acceptConnectionRequest(connectionId, senderId) {
    const payload = connectionId ? { connectionId } : { senderId };
    const { data } = await api.post('/api/connections/accept',
        payload,
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function rejectConnectionRequest(connectionId, senderId) {
    const payload = connectionId ? { connectionId } : { senderId };
    const { data } = await api.post('/api/connections/reject',
        payload,
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function blockUser(targetUserId) {
    const { data } = await api.post('/api/connections/block',
        { targetUserId },
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function getConnections() {
    const { data } = await api.get('/api/connections/list', { headers: getAuthHeaders() });
    return data.connections;
}

export async function getPendingRequests() {
    const { data } = await api.get('/api/connections/requests', { headers: getAuthHeaders() });
    return data.requests;
}

export async function getConnectionStatus(targetUserId) {
    const { data } = await api.get(`/api/connections/status/${targetUserId}`, { headers: getAuthHeaders() });
    return data;
}

// --- Notifications ---

export async function getNotifications() {
    const { data } = await api.get('/api/notifications', { headers: getAuthHeaders() });
    return data.notifications;
}

export async function markNotificationAsRead(notificationId) {
    const { data } = await api.post('/api/notifications/read',
        { notificationId },
        { headers: getAuthHeaders() }
    );
    return data;
}

export async function markNotificationAsUnread(notificationId) {
    const { data } = await api.post('/api/notifications/unread',
        { notificationId },
        { headers: getAuthHeaders() }
    );
    return data;
}

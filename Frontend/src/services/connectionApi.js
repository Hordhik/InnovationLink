import axios from 'axios';
import { getToken } from '../auth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

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

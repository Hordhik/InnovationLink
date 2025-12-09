import axios from 'axios';
import { getToken } from '../auth';

let API_URL;

if (import.meta.env.VITE_API_URL) {
  API_URL = import.meta.env.VITE_API_URL;
} else if (window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001";
} else {
  API_URL = "http://10.123.23.187:5001";
}

export const setMyTeam = async (team) => {
    const token = getToken();
    if (import.meta.env.VITE_DEBUG_TEAM) {
        try {
            const summary = (team || []).map(m => {
                const photo = m?.photo || '';
                let mime = null, size = 0;
                if (typeof photo === 'string' && photo.startsWith('data:')) {
                    const match = photo.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) { mime = match[1]; size = match[2]?.length || 0; }
                }
                return { name: m?.name || '', hasPhoto: !!photo, mime, b64Len: size, head: typeof photo === 'string' ? photo.slice(0, 40) : '' };
            });
            // eslint-disable-next-line no-console
            console.log('[TEAM DEBUG] Sending team payload summary:', summary);
        } catch (e) { /* ignore logging errors */ }
    }
    const resp = await axios.post(`${API_URL}/api/team/bulk`, { team }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return resp.data;
};

export const getMyTeam = async () => {
    const token = getToken();
    const resp = await axios.get(`${API_URL}/api/team/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return resp.data;
};

export const addTeamMember = async (member) => {
    const token = getToken();
    if (import.meta.env.VITE_DEBUG_TEAM) {
        try {
            const photo = member?.photo || '';
            let mime = null, size = 0;
            if (typeof photo === 'string' && photo.startsWith('data:')) {
                const match = photo.match(/^data:([^;]+);base64,(.+)$/);
                if (match) { mime = match[1]; size = match[2]?.length || 0; }
            }
            // eslint-disable-next-line no-console
            console.log('[TEAM DEBUG] Adding member:', { name: member?.name || '', hasPhoto: !!photo, mime, b64Len: size });
        } catch { }
    }
    const resp = await axios.post(`${API_URL}/api/team`, member, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return resp.data;
};

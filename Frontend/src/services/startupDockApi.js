import axios from 'axios';
import { getToken } from '../auth.js';

let API_URL;

if (import.meta.env.VITE_API_URL) {
  API_URL = import.meta.env.VITE_API_URL;
} else if (window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001";
} else {
  API_URL = "http://10.123.23.187:5001";
}

// Create a helper function to get auth headers
const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches all file metadata for the user's dock.
 */
export async function getMyDock() {
    const { data } = await axios.get(`${API_URL}/api/startup-dock/me`, {
        headers: getAuthHeaders(),
    });
    return data; // Returns { files: { pitch: [], demo: [], patent: [] } }
}

/**
 * Uploads a new file.
 * @param {string} category - 'pitch', 'demo', or 'patent'
 * @param {string} fileName - The name of the file
 * @param {string} fileDataURI - The base64 Data URI of the file
 */
export async function uploadFile(category, fileName, fileDataURI) {
    const payload = { category, fileName, fileDataURI };
    const { data } = await axios.post(`${API_URL}/api/startup-dock/upload`, payload, {
        headers: getAuthHeaders(),
    });
    return data;
}

/**
 * Deletes a file by its ID.
 */
export async function deleteFile(file_id) {
    const { data } = await axios.delete(`${API_URL}/api/startup-dock/files/${file_id}`, {
        headers: getAuthHeaders(),
    });
    return data;
}

/**
 * Sets a file as primary for its category.
 * @param {number} file_id - The ID of the file
 * @param {string} category - The category ('pitch', 'demo', 'patent')
 */
export async function setPrimaryFile(file_id, category) {
    const payload = { category };
    const { data } = await axios.post(
        `${API_URL}/api/startup-dock/files/${file_id}/set-primary`,
        payload,
        {
            headers: getAuthHeaders(),
        }
    );
    return data;
}

/**
 * Gets the URL to view/download a file's raw data.
 * This URL is protected by the auth token.
 */
export function getFileViewerUrl(file_id) {
    // This just constructs the URL. The auth token must be added by the
    // component that uses this (e.g., in a fetch request or an <a> tag
    // if you handle token authentication differently for downloads).
    // For simplicity, we'll link directly, but this assumes browser
    // will send the auth cookie if you have one.
    // A more robust way is to fetch the blob and create an object URL.
    const token = getToken();
    // Note: This is a simplified way. For robust video/PDF viewing,
    // you might fetch the blob and use URL.createObjectURL().
    return `${API_URL}/api/startup-dock/files/${file_id}/data?token=${token}`;
}

/**
 * Public viewer URL (investor view) for a specific startup's PRIMARY file.
 */
export function getPublicFileViewerUrl(username, file_id) {
    const token = getToken();
    return `${API_URL}/api/startup-dock/public/${encodeURIComponent(username)}/files/${file_id}/data?token=${token}`;
}

// Frontend/src/services/investorApi.js
import { getToken } from '../auth.js';

const BASE_URL = 'http://localhost:5001/api/investors';

// Helper function to handle fetch responses
async function handleResponse(response) {
    // ... (keep handleResponse as provided before) ...
    if (!response.ok) {
        const data = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(data.message || `API request failed: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {};
}

// Helper function to create authenticated headers
function getAuthHeaders() {
    // ... (keep getAuthHeaders as provided before) ...
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Fetches the list of all investors (basic info: id, user_id, username).
 * Requires authentication as a startup user.
 */
export const getAllInvestors = async () => {
    console.log("Attempting to fetch investors list...");
    const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    console.log("Fetch list response status:", response.status);
    return handleResponse(response);
};

// --- NEW FUNCTION ---
/**
 * Fetches details for a single investor by their profile ID.
 * Requires authentication as a startup user.
 * @param {number} investorId - The ID of the investor profile (i.id)
 */
export const getInvestorById = async (investorId) => {
    console.log(`Attempting to fetch details for investor ID: ${investorId}...`);
    if (!investorId) {
        throw new Error("Investor ID is required.");
    }
    const response = await fetch(`${BASE_URL}/${investorId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    console.log(`Fetch details response status for ID ${investorId}:`, response.status);
    return handleResponse(response);
};


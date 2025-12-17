// This file handles all API calls to your backend's post routes.
import { getToken } from '../auth.js';

let API_URL;

if (import.meta.env.VITE_API_URL) {
  API_URL = import.meta.env.VITE_API_URL;
} else if (window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001/api/posts";
} else {
  API_URL = "http://10.123.23.187:5001/api/posts";
}

// Helper function to handle fetch responses
async function handleResponse(response) {
    if (!response.ok) {
        const data = await response.json().catch(() => ({})); // Try to parse error, fallback to empty object
        throw new Error(data.message || `API request failed with status ${response.status}`);
    }
    // Handle "OK" responses that might not have a body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {}; // Return empty object for non-json responses
}

// Helper function to create authenticated headers
function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    // Only add the Authorization header if a token exists.
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Creates a new post.
 * @param {object} postData - { title, subtitle, content, tags }
 */
export const createPost = async (postData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(), // Requires Auth
        body: JSON.stringify(postData),
    });
    return handleResponse(response);
};

/**
 * Fetches all posts for the public feed.
 */
export const getAllPosts = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

/**
 * Fetches only the posts for the logged-in user.
 */
export const getMyPosts = async () => {
    const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: getAuthHeaders(), // Requires Auth
    });
    return handleResponse(response);
};

/**
 * Fetches a single post by its ID.
 * @param {string} postId - The ID of the post
 */
export const getPostById = async (postId) => {
    const response = await fetch(`${API_URL}/${postId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

/**
 * Updates an existing post by its ID.
 * @param {string} postId - The ID of the post
 * @param {object} updatedData - The updated fields (title, subtitle, content, tags, etc.)
 */
export const updatePost = async (postId, updatedData) => {
    const response = await fetch(`${API_URL}/${postId}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Requires Auth
        body: JSON.stringify(updatedData),
    });
    return handleResponse(response);
};

/**
 * Deletes a post by its ID.
 * @param {string} postId - The ID of the post
 */
export const deletePost = async (postId) => {
    const response = await fetch(`${API_URL}/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // Requires Auth
    });
    return handleResponse(response);
};

/**
 * Fetches posts by a specific user ID.
 * @param {string} userId - The ID of the user
 */
export const getPostsByUserId = async (userId) => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

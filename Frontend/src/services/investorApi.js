// Frontend/src/services/investorApi.js
import axios from "axios";
import { getToken } from "../auth.js";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5001";
const BASE_URL = `${API_ROOT}/api/investors`;

// -------------------------------------------------------------
//  AXIOS INSTANCE
// -------------------------------------------------------------
const api = axios.create({
  baseURL: API_ROOT,
  headers: { "Content-Type": "application/json" },
});

// Inject token automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "API Request Failed";

    return Promise.reject(new Error(message));
  }
);

// -------------------------------------------------------------
//  PUBLIC / PRIVATE INVESTOR ENDPOINTS
// -------------------------------------------------------------

/**
 * Fetch list of all investors (basic info)
 */
export const getAllInvestors = async () => {
  const res = await api.get(`${BASE_URL}`);
  return res.data;
};

/**
 * Fetch single investor by ID
 */
export const getInvestorById = async (investorId) => {
  if (!investorId) throw new Error("Investor ID is required.");
  const res = await api.get(`${BASE_URL}/${investorId}`);
  return res.data;
};

/**
 * Fetch logged-in investor profile
 */
export const getMyInvestorProfile = async () => {
  const res = await api.get(`${BASE_URL}/me`);
  return res.data;
};

/**
 * Save logged-in investor profile
 */
export const saveMyInvestorProfile = async (payload) => {
  const res = await api.put(`${BASE_URL}/me`, payload);
  return res.data;
};

/**
 * Fetch investor by PUBLIC username (for profile)
 * /investor/public/:username
 */
export const getInvestorByUsername = async (username) => {
  if (!username) throw new Error("Username is required.");
  const res = await api.get(`${BASE_URL}/public/${encodeURIComponent(username)}`);
  return res.data;
};

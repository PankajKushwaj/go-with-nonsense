import axios from "axios";

const normalizeApiUrl = (value) => {
  const rawValue = String(value || "").trim();
  const withoutKey = rawValue.startsWith("VITE_API_URL=") ? rawValue.split("=").slice(1).join("=") : rawValue;
  return withoutKey || "http://localhost:5000/api";
};

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gwn_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.message || error?.message || fallback;

export default api;

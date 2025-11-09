// src/api/axiosConfig.js
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ✅ Create axios instance
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`, // only once /api/v1
  withCredentials: true,        // important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: intercept requests to attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Optional: response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 Axios error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;

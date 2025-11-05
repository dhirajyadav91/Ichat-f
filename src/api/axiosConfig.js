// api/axiosConfig.js - FIXED VERSION
import axios from "axios";

// ✅ Safe environment variable with fallback
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

console.log("✅ ENV (Frontend) =>", API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request Interceptor - Add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Export both default and named export
export default axiosInstance;
export { API_URL }; // ✅ Add this named export
import axios from "axios";

export const BASE_URL = typeof window !== "undefined" 
  ? `${window.location.protocol}//${window.location.hostname}:5000` 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

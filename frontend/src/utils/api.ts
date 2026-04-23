import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE || "http://localhost:9991"}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Potentially redirect to login or clear auth state
      // This will be handled in the store usually
    }
    return Promise.reject(error);
  }
);

export default api;

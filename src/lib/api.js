import axios from 'axios';
import { handleAuthError, clearAuthData } from '../utils/auth';

let isRefreshing = false;
let refreshSubscribers = [];

// Call all subscribers after refresh succeeds
function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

// Subscribe a failed request to be retried later
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for sending cookies
});

// 👉 Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 👉 Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle authentication errors
    if (handleAuthError(error)) {
      return Promise.reject(error);
    }

    // Handle only if response is 401 and not already retried (for other 401 cases)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until token is refreshed
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            originalRequest._retry = true;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post('/auth/refresh-token', {});
        isRefreshing = false;

        onRefreshed(); // Retry all failed requests
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Clear auth data and redirect to login on refresh failure
        clearAuthData();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Gracefully reject with actual error response (if available)
    if (error?.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
import { BASE_URL } from '@/constants/api-paths';
import axios from 'axios';
import { handleAuthError } from '../utils/auth';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 👉 Request Interceptor
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (handleAuthError(error)) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

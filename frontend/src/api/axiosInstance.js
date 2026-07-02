import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Request Interceptor: Attach Supabase JWT
axiosInstance.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and refresh session, and unwrap ApiResponse
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse: { success, data, message }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        return Promise.reject(new Error(response.data.message || 'API request failed'));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          await supabase.auth.signOut();
          return Promise.reject(refreshError || new Error('Session refresh failed'));
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

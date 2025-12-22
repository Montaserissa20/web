import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Base URL for static files (uploads) - remove '/api' from the end
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable credentials for CSRF cookies
});

// Helper to get full URL for uploaded images
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Prepend backend base URL for relative paths
  return `${BACKEND_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Fetch CSRF token from the server
 * This should be called on app initialization
 */
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: { csrfToken: string };
    }>('/auth/csrf');

    if (response.data?.success && response.data.data?.csrfToken) {
      return response.data.data.csrfToken;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

export default apiClient;

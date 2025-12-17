import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Base URL for static files (uploads) - remove '/api' from the end
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
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

export default apiClient;

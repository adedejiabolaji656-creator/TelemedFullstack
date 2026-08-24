import axios from 'axios';

// In development the Vite dev server proxies /api and /uploads to the backend.
// For production, set VITE_API_URL to the full backend origin and use absolute paths.
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

// Attach the JWT token to every request.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global auth errors.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLoginRequest = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isLoginRequest && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

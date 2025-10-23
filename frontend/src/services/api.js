import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Attach bearer token
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('tms_access');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('tms_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/auth/refresh', { token: refresh });
          localStorage.setItem('tms_access', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (_) {
          // fallthrough to reject below
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import api from './api';

const TOKEN_KEY = 'projectnest_token';

const apiWithToken = {
  get: (url, config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.get(url, { ...config, headers: { Authorization: `Bearer ${token}`, ...(config?.headers || {}) } });
  },
  post: (url, data, config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.post(url, data, { ...config, headers: { Authorization: `Bearer ${token}`, ...(config?.headers || {}) } });
  },
  put: (url, data, config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.put(url, data, { ...config, headers: { Authorization: `Bearer ${token}`, ...(config?.headers || {}) } });
  },
  patch: (url, data, config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.patch(url, data, { ...config, headers: { Authorization: `Bearer ${token}`, ...(config?.headers || {}) } });
  },
  delete: (url, config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    return api.delete(url, { ...config, headers: { Authorization: `Bearer ${token}`, ...(config?.headers || {}) } });
  },
};

export default apiWithToken;

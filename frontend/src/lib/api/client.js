import { API_CONFIG } from '../../config/api';
import { applyInterceptors } from './interceptors';

const interceptedFetch = applyInterceptors(window.fetch.bind(window));

export const apiClient = {
  async get(endpoint, customHeaders = {}) {
    const res = await interceptedFetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: customHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  async post(endpoint, data = {}, customHeaders = {}) {
    const res = await interceptedFetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  async put(endpoint, data = {}, customHeaders = {}) {
    const res = await interceptedFetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: customHeaders,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  },

  async delete(endpoint, customHeaders = {}) {
    const res = await interceptedFetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: customHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  },
};

export default apiClient;

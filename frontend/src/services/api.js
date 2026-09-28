import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('queueless_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('queueless_token');
      localStorage.removeItem('queueless_user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const organizationAPI = {
  list: () => api.get('/organizations'),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.patch(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`)
};

export const serviceAPI = {
  listByOrg: (orgId) => api.get(`/organizations/${orgId}/services`),
  getById: (id) => api.get(`/services/${id}`),
  create: (orgId, data) => api.post(`/organizations/${orgId}/services`, data),
  update: (id, data) => api.patch(`/services/${id}`, data),
  deactivate: (id) => api.delete(`/services/${id}`),
  getCounters: (serviceId) => api.get(`/services/${serviceId}/counters`),
  createCounter: (serviceId, data) => api.post(`/services/${serviceId}/counters`, data)
};

export const counterAPI = {
  update: (id, data) => api.patch(`/counters/${id}`, data),
  delete: (id) => api.delete(`/counters/${id}`),
  callNext: (counterId) => api.post(`/counters/${counterId}/call-next`)
};

export const queueAPI = {
  getState: (serviceId) => api.get(`/services/${serviceId}/queue`),
  join: (serviceId, data) => api.post(`/services/${serviceId}/queue/join`, data),
  listEntries: (serviceId, status = null) =>
    api.get(`/services/${serviceId}/queue/entries${status ? `?status=${status}` : ''}`),
  getEntry: (id) => api.get(`/queue-entries/${id}`),
  cancelEntry: (id) => api.delete(`/queue-entries/${id}`),
  skipEntry: (id) => api.post(`/queue-entries/${id}/skip`),
  recallEntry: (id) => api.post(`/queue-entries/${id}/recall`),
  transferEntry: (id, data) => api.post(`/queue-entries/${id}/transfer`, data),
  completeEntry: (id) => api.post(`/queue-entries/${id}/complete`)
};

export default api;

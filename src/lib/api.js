import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Event APIs
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id, data) => api.post(`/events/${id}/register`, data || {}),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`),
  getUserCreated: () => api.get('/events/user/created'),
  getUserRegistered: () => api.get('/events/user/registered'),
};

export const paymentAPI = {
  verifyKhalti: (payload) => api.post('/payments/khalti/verify', payload),
  initiateKhalti: (payload) => api.post('/payments/khalti/initiate', payload),
  lookupKhalti: (payload) => api.post('/payments/khalti/lookup', payload),
  verifyEsewa: (payload) => api.post('/payments/esewa/verify', payload),
  getEsewaSignature: (payload) => api.post('/payments/esewa/checkout', payload),
  getEsewaStatus: (payload) => api.post('/payments/esewa/status', payload)
};

export const bookingAPI = {
  getForEvent: (eventId) => api.get('/bookings', { params: { eventId } })
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;

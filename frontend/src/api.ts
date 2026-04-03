import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (username: string, password: string) =>
  api.post('/api/auth/login', { username, password });

export const register = (data: any) =>
  api.post('/api/auth/register', data);

// Chat
export const sendMessage = (message: string, role: string, sessionId?: string) =>
  api.post('/api/chat', { message, role, channel: 'web', session_id: sessionId });

// Orders
export const getOrders = (params?: any) =>
  api.get('/api/orders', { params });

export const getOrder = (id: number) =>
  api.get(`/api/orders/${id}`);

// Analytics
export const getAnalyticsSummary = (period: string = '7d') =>
  api.get('/api/analytics/summary', { params: { period } });

export const getAnalyticsCharts = (period: string = '7d') =>
  api.get('/api/analytics/charts', { params: { period } });

export default api;
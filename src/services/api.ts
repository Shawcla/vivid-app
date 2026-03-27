import axios, { AxiosInstance, AxiosError } from 'axios';
import { getItem, setItem, deleteItem } from '../utils/storage';

const API_URL = 'http://72.62.196.174:4000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { api, API_URL };

export const authAPI = {
  register: (data: { name: string; email: string; password: string; username: string; plan?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

export const filmsAPI = {
  list: (params?: { page?: number; limit?: number; category?: string; genre?: string; sort?: string; search?: string }) =>
    api.get('/films', { params }),
  featured: () => api.get('/films/featured'),
  get: (id: string) => api.get(`/films/${id}`),
  search: (q: string) => api.get('/films/search', { params: { q } }),
  like: (id: string) => api.post(`/films/${id}/like`),
  addToWatchlist: (id: string) => api.post('/watchlist', { film_id: id }),
  removeFromWatchlist: (id: string) => api.delete(`/watchlist/${id}`),
  saveProgress: (id: string, seconds: number) =>
    api.post(`/films/${id}/progress`, { current_time: seconds }),
};

export const creatorsAPI = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/creators', { params }),
  get: (username: string) => api.get(`/creators/${username}`),
  films: (username: string) => api.get(`/creators/${username}/films`),
  getWatchlist: () => api.get('/creators/dashboard/watchlist'),
  getHistory: () => api.get('/creators/dashboard/watch-history'),
};

export const aiAPI = {
  // Chat with AI about a film or general movie questions
  chat: (message: string, film_id?: string) =>
    api.post('/ai/chat', { message, film_id }),
  
  // Get AI-powered movie recommendations
  recommend: (params?: { mood?: string; genre?: string; actor?: string; decade?: string }) =>
    api.post('/ai/recommend', params),
  
  // Natural language search - converts query to keywords
  search: (query: string) =>
    api.post('/ai/search', { query }),
  
  // Check if AI service is available
  health: () => api.get('/ai/health'),
};

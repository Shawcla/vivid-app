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
  getProfile: (username: string) => api.get(`/creators/${username}`),
  films: (username: string) => api.get(`/creators/${username}/films`),
  getDashboardStats: () => api.get('/creators/dashboard/stats'),
  getDashboardFilms: () => api.get('/creators/dashboard/films'),
  getWatchlist: () => api.get('/creators/dashboard/watchlist'),
  getHistory: () => api.get('/creators/dashboard/history'),
};

export const uploadAPI = {
  getPresignedUrl: (filename: string, contentType: string, fileSize: number) =>
    api.post('/upload/presign', { filename, contentType, fileSize }),
  createFilm: (data: any) => api.post('/upload/film', data),
  uploadThumbnail: async (uri: string) => {
    const form = new FormData();
    form.append('thumbnail', {
      uri,
      name: `thumbnail-${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);
    return api.post('/upload/thumbnail', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
  uploadToStorage: async (
    uploadUrl: string,
    fileUri: string,
    contentType: string,
    onProgress?: (progress: number) => void
  ) => {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    await axios.put(uploadUrl, blob, {
      headers: { 'Content-Type': contentType },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
      timeout: 0,
    });
  },
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

import { create } from 'zustand';
import { authAPI } from '../services/api';
import { getItem, setItem, deleteItem } from '../utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar_url?: string;
  plan: 'viewer' | 'creator' | 'studio';
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; username: string; plan?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // ─── Load user on app start ─────────────────────────────────────────────
  loadUser: async () => {
    try {
      const token = await getItem('accessToken');
      if (!token) return set({ isLoading: false });

      const { data } = await authAPI.getMe();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      await deleteItem('accessToken');
      await deleteItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ─── Login ──────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const { data } = await authAPI.login(email, password);
    await setItem('accessToken', data.accessToken);
    await setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  // ─── Register ───────────────────────────────────────────────────────────
  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    await setItem('accessToken', data.accessToken);
    await setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  // ─── Logout ─────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      const refreshToken = await getItem('refreshToken');
      if (refreshToken) await authAPI.logout(refreshToken);
    } catch {}
    await deleteItem('accessToken');
    await deleteItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  // ─── Update user locally ─────────────────────────────────────────────────
  updateUser: (data) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...data } });
  },
}));

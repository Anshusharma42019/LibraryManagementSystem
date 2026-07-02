import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      library: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user, library, accessToken, refreshToken } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        set({ user, library, accessToken, refreshToken, isAuthenticated: true });
        return user;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.clear();
        set({ user: null, library: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const res = await api.get('/auth/me');
        set({ user: res.data.data.user, library: res.data.data.library });
      },

      isSuperAdmin: () => get().user?.role === 'superadmin',
      isOwner: () => get().user?.role === 'owner',
      isStaff: () => get().user?.role === 'staff',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        library: state.library,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

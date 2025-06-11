// store/authStore.ts
import { create } from 'zustand';
import { User, Worker } from '@/types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  worker: Worker | null; // Add worker attribute
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setWorker: (worker: Worker | null) => void; // Add setWorker action
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  loginWorker: (worker: Worker, accessToken: string) => void; // Add loginWorker action
  logout: () => void;
}

const authStore = persist<AuthState>(
  (set) => ({
    user: null,
    worker: null, // Initialize worker as null
    accessToken: null,
    isAuthenticated: false,
    hydrated: false,

    // Actions
    setUser: (user) => set({ user }),
    setWorker: (worker) => set({ worker }), // Add setWorker action
    setAccessToken: (accessToken) => set({ accessToken }),

    login: (user, accessToken) => {
      set({ user, worker: null, accessToken, isAuthenticated: true }); // Clear worker on user login
    },

    loginWorker: (worker, accessToken) => {
      set({ worker, user: null, accessToken, isAuthenticated: true }); // Clear user on worker login
    },

    logout: () => {
      set({ user: null, worker: null, accessToken: null, isAuthenticated: false });
    },
  }),
  {
    name: 'auth-store',
    storage: createJSONStorage(() => localStorage),
  }
);

export const useAuthStore = create<AuthState>()(authStore);
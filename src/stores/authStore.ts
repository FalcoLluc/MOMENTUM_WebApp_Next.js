// store/authStore.ts
import { create } from 'zustand';
import { User } from '@/types';
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
  
    // Actions
    setUser: (user) => set({ user }),
    setAccessToken: (accessToken) => set({ accessToken }),
  
    login: (user, accessToken) => {
      localStorage.setItem('accessToken', accessToken); // Persist token
      set({ user, accessToken, isAuthenticated: true });
    },
  
    logout: () => {
      localStorage.removeItem('accessToken');
      set({ user: null, accessToken: null, isAuthenticated: false });
    },
  }),
  {
    name: "auth-store",
    storage: createJSONStorage(() => localStorage), 
  }

))

export const useAuthStoreHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useAuthStore.persist.onHydrate(() => setHydrated(false))

    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => setHydrated(true))

    setHydrated(useAuthStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}

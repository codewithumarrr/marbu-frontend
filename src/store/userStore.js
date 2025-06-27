import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      
      // User data
      user: null,
      profile: null,
      
      // Loading states
      isLoading: false,
      error: null,
      
      // Actions
      setAuth: (authData) => set({ 
        isAuthenticated: true,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        user: authData.user || null,
        error: null
      }),
      
      setUser: (user) => set({ user }),
      
      setProfile: (profile) => set({ profile }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearAuth: () => set({ 
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        user: null,
        profile: null,
        error: null
      }),
      
      updateToken: (accessToken) => set({ accessToken }),
      
      // Helper methods
      getToken: () => get().accessToken,
      getUser: () => get().user,
      getProfile: () => get().profile,
    }),
    {
      name: "user-storage", // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);

import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: {
    name: "Fareed Khan",
    designation: "Site Manager",
    lastLogin: "2025-06-17 09:30 AM",
  },
  setUser: (user) => set({ user }),
}));

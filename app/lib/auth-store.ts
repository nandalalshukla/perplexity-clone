import { create } from "zustand";

export type AuthMode = "sign-in" | "sign-up";

type AuthStore = {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  mode: "sign-in",
  setMode: (mode) => set({ mode }),
}));

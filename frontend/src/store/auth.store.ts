import api from "@/lib/api";
import { UserDto } from "@app/shared";
import { create } from "zustand";

interface AuthStore {
  user: UserDto | null;
  status: "loading" | "authenticated" | "unauthenticated";
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",
  fetchUser: async () => {
    set({ status: "loading" });
    try {
      const response = await api.get("/auth/me");
      set({ user: response.data, status: "authenticated" });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      set({ user: null, status: "unauthenticated" });
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null, status: "unauthenticated" });
    } catch (error) {
      console.error("Failed to logout:", error);
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
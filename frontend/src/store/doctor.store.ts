import api from "@/lib/api";
import { DoctorDto } from "@app/shared";
import { create } from "zustand";

interface DoctorStore {
  doctor: DoctorDto | null;
  status: "idle" | "loading" | "success" | "error";
  fetchDoctor: () => Promise<void>;
  clearDoctor: () => void;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctor: null,
  status: "idle",
  fetchDoctor: async () => {
    set({ status: "loading" });
    try {
      const response = await api.get<DoctorDto>("/doctors/me");
      set({ doctor: response.data, status: "success" });
    } catch (error) {
      console.error("Failed to fetch doctor profile:", error);
      set({ doctor: null, status: "error" });
    }
  },
  clearDoctor: () => {
    set({ doctor: null, status: "idle" });
  },
}));

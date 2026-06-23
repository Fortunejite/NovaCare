import api from "@/lib/api";
import { LabTechnicianDto } from "@app/shared";
import { create } from "zustand";

interface LabTechnicianStore {
  labTechnician: LabTechnicianDto | null;
  status: "idle" | "loading" | "success" | "error";
  fetchLabTechnician: () => Promise<void>;
  clearLabTechnician: () => void;
}

export const useLabTechnicianStore = create<LabTechnicianStore>((set) => ({
  labTechnician: null,
  status: "idle",
  fetchLabTechnician: async () => {
    set({ status: "loading" });
    try {
      const response = await api.get<LabTechnicianDto>("/lab-technicians/me");
      set({ labTechnician: response.data, status: "success" });
    } catch (error) {
      console.error("Failed to fetch lab technician profile:", error);
      set({ labTechnician: null, status: "error" });
    }
  },
  clearLabTechnician: () => {
    set({ labTechnician: null, status: "idle" });
  },
}));

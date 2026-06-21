import api from "@/lib/api";
import { PharmacistDto } from "@app/shared";
import { create } from "zustand";

interface PharmacistStore {
  pharmacist: PharmacistDto | null;
  status: "idle" | "loading" | "success" | "error";
  fetchPharmacist: () => Promise<void>;
  clearPharmacist: () => void;
}

export const usePharmacistStore = create<PharmacistStore>((set) => ({
  pharmacist: null,
  status: "idle",
  fetchPharmacist: async () => {
    set({ status: "loading" });
    try {
      const response = await api.get<PharmacistDto>("/pharmacists/me");
      set({ pharmacist: response.data, status: "success" });
    } catch (error) {
      console.error("Failed to fetch pharmacist profile:", error);
      set({ pharmacist: null, status: "error" });
    }
  },
  clearPharmacist: () => {
    set({ pharmacist: null, status: "idle" });
  },
}));

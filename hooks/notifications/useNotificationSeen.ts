import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Remembers when the user last opened the notifications screen so the bell can
// show how many items are new. Kept on the device only.
interface SeenState {
  lastSeen: string | null;
  markSeen: () => void;
}

export const useNotificationSeen = create<SeenState>()(
  persist(
    (set) => ({
      lastSeen: null,
      markSeen: () => set({ lastSeen: new Date().toISOString() }),
    }),
    {
      name: "notification-seen",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

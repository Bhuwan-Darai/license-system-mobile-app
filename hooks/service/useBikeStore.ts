import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Bike records live on the device only (AsyncStorage); nothing is synced to
// the backend. Bill photos are copied into the app's document directory and
// only their file URI is kept here.

export interface Bike {
  id: string;
  name: string;
  brand?: string;
  registration?: string;
  year?: string;
  /** Odometer reading (km) when the bike was added. */
  startOdometer: number;
}

export interface FuelEntry {
  id: string;
  bikeId: string;
  /** YYYY-MM-DD */
  date: string;
  odometer: number;
  liters: number;
  totalCost: number;
  /** Tank was filled up completely; needed for accurate mileage. */
  fullTank: boolean;
}

export interface ServiceRecord {
  id: string;
  bikeId: string;
  /** YYYY-MM-DD */
  date: string;
  odometer?: number;
  totalCost: number;
  parts: string[];
  notes?: string;
  billImage?: string;
}

interface BikeState {
  bikes: Bike[];
  activeBikeId: string | null;
  fuelEntries: FuelEntry[];
  serviceRecords: ServiceRecord[];

  addBike: (bike: Omit<Bike, "id">) => string;
  setActiveBike: (id: string) => void;
  removeBike: (id: string) => void;
  addFuelEntry: (entry: Omit<FuelEntry, "id">) => void;
  removeFuelEntry: (id: string) => void;
  addServiceRecord: (record: Omit<ServiceRecord, "id">) => void;
  removeServiceRecord: (id: string) => void;
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const useBikeStore = create<BikeState>()(
  persist(
    (set) => ({
      bikes: [],
      activeBikeId: null,
      fuelEntries: [],
      serviceRecords: [],

      addBike: (bike) => {
        const id = newId();
        set((s) => ({ bikes: [...s.bikes, { ...bike, id }], activeBikeId: id }));
        return id;
      },
      setActiveBike: (id) => set({ activeBikeId: id }),
      removeBike: (id) =>
        set((s) => {
          const bikes = s.bikes.filter((b) => b.id !== id);
          return {
            bikes,
            activeBikeId: s.activeBikeId === id ? (bikes[0]?.id ?? null) : s.activeBikeId,
            fuelEntries: s.fuelEntries.filter((e) => e.bikeId !== id),
            serviceRecords: s.serviceRecords.filter((r) => r.bikeId !== id),
          };
        }),
      addFuelEntry: (entry) =>
        set((s) => ({ fuelEntries: [...s.fuelEntries, { ...entry, id: newId() }] })),
      removeFuelEntry: (id) =>
        set((s) => ({ fuelEntries: s.fuelEntries.filter((e) => e.id !== id) })),
      addServiceRecord: (record) =>
        set((s) => ({ serviceRecords: [...s.serviceRecords, { ...record, id: newId() }] })),
      removeServiceRecord: (id) =>
        set((s) => ({ serviceRecords: s.serviceRecords.filter((r) => r.id !== id) })),
    }),
    {
      name: "bike-records",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export interface MileageStats {
  /** Mileage of the most recent full-tank to full-tank segment (km/l). */
  last: number | null;
  /** Distance-weighted average over every completed segment (km/l). */
  average: number | null;
  totalKm: number;
  totalFuelCost: number;
  totalLiters: number;
  /** Highest odometer reading seen across fuel entries (or start reading). */
  currentOdometer: number;
}

// Full-tank method: litres added between two full-tank fills are what the
// distance between them consumed. Part-fills are accumulated until the next
// full tank closes the segment.
export function computeMileage(bike: Bike, entries: FuelEntry[]): MileageStats {
  const sorted = [...entries].sort((a, b) => a.odometer - b.odometer);

  let anchorOdo: number | null = null;
  let litersSince = 0;
  let last: number | null = null;
  let km = 0;
  let liters = 0;

  for (const e of sorted) {
    if (anchorOdo !== null) {
      litersSince += e.liters;
      if (e.fullTank) {
        const dist = e.odometer - anchorOdo;
        if (dist > 0 && litersSince > 0) {
          last = dist / litersSince;
          km += dist;
          liters += litersSince;
        }
      }
    }
    if (e.fullTank) {
      anchorOdo = e.odometer;
      litersSince = 0;
    }
  }

  return {
    last,
    average: liters > 0 ? km / liters : null,
    totalKm: km,
    totalLiters: entries.reduce((s, e) => s + e.liters, 0),
    totalFuelCost: entries.reduce((s, e) => s + e.totalCost, 0),
    currentOdometer: Math.max(bike.startOdometer, ...entries.map((e) => e.odometer)),
  };
}

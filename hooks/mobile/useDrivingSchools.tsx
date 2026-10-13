import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";

// Driving schools come from OpenStreetMap via the public Overpass API.
// The public instances are often busy, so each is tried in turn.
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const SEARCH_RADIUS_M = 15000;

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface DrivingSchool {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Straight-line distance from the user, in km. */
  distanceKm: number;
  address?: string;
  phone?: string;
  website?: string;
}

export type LocationState =
  | { status: "loading" }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "error" }
  | { status: "ready"; coords: Coords };

// Falls back to the last known fix so the list can show instantly.
export async function resolveLocation(): Promise<LocationState> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { status: "denied", canAskAgain: perm.canAskAgain };

    const pos =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return {
      status: "ready",
      coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
    };
  } catch {
    return { status: "error" };
  }
}

function haversineKm(a: Coords, b: Coords) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export const useQueryDrivingSchools = (coords?: Coords) =>
  useQuery({
    // Rounded so tiny GPS jitter doesn't refetch.
    queryKey: [
      "driving-schools",
      coords ? coords.latitude.toFixed(2) : null,
      coords ? coords.longitude.toFixed(2) : null,
    ],
    enabled: !!coords,
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<DrivingSchool[]> => {
      const { latitude, longitude } = coords!;
      const query = `[out:json][timeout:25];(nwr["amenity"="driving_school"](around:${SEARCH_RADIUS_M},${latitude},${longitude}););out center tags;`;

      let json: any = null;
      for (const url of OVERPASS_URLS) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
            signal: controller.signal,
          });
          if (res.ok) {
            json = await res.json();
            break;
          }
        } catch {
          // fall through to the next instance
        } finally {
          clearTimeout(timer);
        }
      }
      if (!json) throw new Error("Driving school request failed");

      return ((json?.elements ?? []) as OverpassElement[])
        .flatMap((el): DrivingSchool[] => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.center?.lon ?? el.lon;
          if (lat == null || lon == null) return [];
          const t = el.tags ?? {};
          const address = [t["addr:housenumber"], t["addr:street"], t["addr:city"]]
            .filter(Boolean)
            .join(", ");
          return [
            {
              id: `${el.type}/${el.id}`,
              name: t.name || t["name:en"] || "Driving school",
              latitude: lat,
              longitude: lon,
              distanceKm: haversineKm(coords!, { latitude: lat, longitude: lon }),
              address: address || undefined,
              phone: t.phone || t["contact:phone"] || undefined,
              website: t.website || t["contact:website"] || undefined,
            },
          ];
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    },
  });

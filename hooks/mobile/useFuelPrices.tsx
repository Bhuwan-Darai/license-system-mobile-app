import { useQuery } from "@tanstack/react-query";

// Nepal Oil Corporation publishes its price list through a public JSON feed.
// It lives on a different host than our backend, so plain fetch is used
// instead of the shared axios instance (whose interceptors add auth cookies
// and pop alerts).
const NOC_FUEL_PRICES_URL = "https://beta.noc.org.np/api/fuel-prices?per_page=500";

// Fuels shown on the home screen, in display order. `city` prices are the
// Kathmandu valley rates.
const FUELS = [
  { slug: "petrol", label: "Petrol", unit: "per litre" },
  { slug: "diesel", label: "Diesel", unit: "per litre" },
  { slug: "kerosene", label: "Kerosene", unit: "per litre" },
  { slug: "lp-gas", label: "LP Gas", unit: "14.2 kg cylinder" },
] as const;

const CITY = "kathmandu";

export interface FuelPrice {
  slug: string;
  label: string;
  unit: string;
  price: number;
  /** Change versus the previous revision (0 when unchanged or unknown). */
  change: number;
  /** Date of the latest revision, ISO-ish "YYYY-MM-DD HH:mm:ss". */
  date: string;
}

interface RawFuelPrice {
  price: string;
  price_date: string;
  fuel_type: { slug: string };
  location: { name: string };
}

export const useQueryFuelPrices = () =>
  useQuery({
    queryKey: ["nepal-fuel-prices", CITY],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<FuelPrice[]> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch(NOC_FUEL_PRICES_URL, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Fuel price request failed (${res.status})`);
        const json = await res.json();
        const rows = ((json?.data ?? []) as RawFuelPrice[])
          .filter((r) => r.location?.name?.toLowerCase() === CITY)
          // Newest first; price_date is zero-padded so string compare is safe.
          .sort((a, b) => b.price_date.localeCompare(a.price_date));

        return FUELS.flatMap((fuel) => {
          const history = rows.filter((r) => r.fuel_type?.slug === fuel.slug);
          if (history.length === 0) return [];
          const latest = Number(history[0].price);
          // Entries sharing the latest date are duplicates, not a revision.
          const previous = history.find(
            (r) => r.price_date.slice(0, 10) < history[0].price_date.slice(0, 10)
          );
          return [
            {
              ...fuel,
              price: latest,
              change: previous ? latest - Number(previous.price) : 0,
              date: history[0].price_date,
            },
          ];
        });
      } finally {
        clearTimeout(timer);
      }
    },
  });

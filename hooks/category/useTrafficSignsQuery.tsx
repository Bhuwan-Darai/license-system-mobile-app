import { useQuery } from "@tanstack/react-query";

import api from "@/axios";

interface Pagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export const useQueryTrafficSigns = (
  page: number = 1,
  // Default to the backend's max page size so callers that just want "all
  // categories" (e.g. a select dropdown) get them without paging through.
  pageSize: number = 100,
  search?: string,
) => {
  // Fetch Traffic Signs (server-side pagination)
  // get traffic signs
  const { data, isLoading, error } = useQuery({
    queryKey: ["traffic-signs"],
    queryFn: async () => {
      const res = await api.get("/traffic-signal", {
        params: { page, pageSize, search },
      });
      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    trafficSigns: data ?? [],
    pagination: data?.pagination as Pagination | undefined,
    isLoading: isLoading,
    error: error,
  };
};

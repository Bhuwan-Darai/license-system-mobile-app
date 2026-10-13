import { useQuery } from "@tanstack/react-query";

import api from "@/axios";

interface Pagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export const useQueryVehicleCategories = (
  page: number = 1,
  // Default to the backend's max page size so callers that just want "all
  // categories" (e.g. a select dropdown) get them without paging through.
  pageSize: number = 100,
  search?: string,
) => {
  // Fetch Categories (server-side pagination)
  // get vehicle categories
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicle-categories"],
    queryFn: async () => {
      const res = await api.get("/mobile/vehicle-categories", {
        params: { page, limit: pageSize, search },
      });
      console.log("vehicle categories", res);
      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
  });

  return {
    categories: data ?? [],
    pagination: data?.pagination as Pagination | undefined,
    isLoading: isLoading,
    error: error,
  };
};

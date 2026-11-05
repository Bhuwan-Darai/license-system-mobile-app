import { useQuery } from "@tanstack/react-query";

import api from "@/axios";

export interface MobileProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  role_name?: string;
  fiscal_year_id?: string;
  theme?: string;
  font_size?: string;
  language?: string;
}

// the axios instance already unwraps response.data
export const useQueryProfile = () =>
  useQuery({
    queryKey: ["mobile-profile"],
    queryFn: async () =>
      ((await api.get("/auth/mobile/me")) as unknown as { data: MobileProfile }).data,
  });

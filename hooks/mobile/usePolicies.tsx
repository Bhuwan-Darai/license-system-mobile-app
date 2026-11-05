import { useQuery } from "@tanstack/react-query";

import { API_URL } from "@/constants";
import { parsePolicy } from "@/utils/policyContent";

// Policies and About Us are public pages managed from the admin dashboard.
// They sit under /public (readable before sign-in) and use plain fetch so a
// missing page doesn't trigger the shared axios error alerts.

export interface PolicyListItem {
  policy_id: string;
  title: string;
  updated_at: string;
}

export interface PolicyPage extends PolicyListItem {
  content: string;
}

async function getPublic<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_URL}/api/v1/public/policies${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } finally {
    clearTimeout(timer);
  }
}

export const useQueryPolicies = () =>
  useQuery({
    queryKey: ["public-policies"],
    queryFn: async () => (await getPublic<PolicyListItem[]>("/")) ?? [],
  });

export const useQueryPolicy = (id?: string) =>
  useQuery({
    queryKey: ["public-policy", id],
    enabled: !!id,
    queryFn: () => getPublic<PolicyPage>(`/${id}`),
  });

export interface PolicySectionItem {
  /** Record the section came from. */
  policy_id: string;
  /** Position of the section inside that record. */
  index: number;
  title: string;
  updated_at: string;
}

/**
 * The policy list as the user should see it: a record that holds several
 * policies in one body is split into one entry per policy.
 */
export const useQueryPolicySections = () =>
  useQuery({
    queryKey: ["public-policy-sections"],
    queryFn: async (): Promise<PolicySectionItem[]> => {
      const list = (await getPublic<PolicyListItem[]>("/")) ?? [];
      const pages = await Promise.all(
        list.map((p) => getPublic<PolicyPage>(`/${p.policy_id}`).catch(() => null))
      );
      const out: PolicySectionItem[] = [];
      list.forEach((item, i) => {
        const page = pages[i];
        const sections = page ? parsePolicy(page.title, page.content) : [];
        if (sections.length === 0) {
          out.push({
            policy_id: item.policy_id,
            index: 0,
            title: item.title,
            updated_at: item.updated_at,
          });
          return;
        }
        sections.forEach((s, index) =>
          out.push({
            policy_id: item.policy_id,
            index,
            title: s.title,
            updated_at: item.updated_at,
          })
        );
      });
      return out;
    },
  });

export const useQueryAboutUs = () =>
  useQuery({
    queryKey: ["public-about-us"],
    queryFn: () => getPublic<PolicyPage>("/about-us"),
  });

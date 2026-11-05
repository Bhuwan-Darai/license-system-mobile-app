import { useQuery } from "@tanstack/react-query";

import api from "@/axios";

// Customer-facing read-only content, served from /mobile/* on the backend.

export interface BlogCategory {
  blog_category_id: string;
  title: string;
  description: string;
  blog_count: number;
}

export interface BlogItem {
  blog_id: string;
  category_id: string;
  category: string;
  title: string;
  subtitle: string;
  content?: string;
  cover_image: string;
  published_at: string;
}

export interface IshiharaCategory {
  ishihara_category_id: string;
  title: string;
  description: string;
  image: string;
  plate_count: number;
}

export interface IshiharaPlate {
  plate_id: string;
  category_id: string;
  title: string;
  image_url: string;
}

export interface SignalCategory {
  traffic_signal_category_id: string;
  title: string;
  description: string;
  signal_count: number;
}

export interface SignalItem {
  traffic_signal_id: string;
  category_id: string;
  title: string;
  english_title: string;
  description: string;
  english_description: string;
  image_url: string;
}

export interface EmergencyItem {
  emergency_number_id: string;
  name: string;
  emergency_number: string;
}

export const useQueryBlogCategories = () =>
  useQuery({
    queryKey: ["mobile-blog-categories"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/blog-categories");
      return (res.data ?? []) as BlogCategory[];
    },
  });

export const useQueryBlogs = (categoryId?: string, search?: string) =>
  useQuery({
    queryKey: ["mobile-blogs", categoryId ?? "all", search ?? ""],
    queryFn: async () => {
      const res: any = await api.get("/mobile/blogs", {
        params: { category: categoryId || undefined, search: search || undefined, limit: 100 },
      });
      return (res.data ?? []) as BlogItem[];
    },
  });

export const useQueryBlog = (blogId?: string) =>
  useQuery({
    queryKey: ["mobile-blog", blogId],
    enabled: !!blogId,
    queryFn: async () => {
      const res: any = await api.get(`/mobile/blogs/${blogId}`);
      return res.data as BlogItem;
    },
  });

export const useQueryIshiharaCategories = () =>
  useQuery({
    queryKey: ["mobile-ishihara-categories"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/ishihara/categories");
      return (res.data ?? []) as IshiharaCategory[];
    },
  });

export const useQueryIshiharaPlates = (categoryId?: string) =>
  useQuery({
    queryKey: ["mobile-ishihara-plates", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const res: any = await api.get("/mobile/ishihara/plates", {
        params: { category: categoryId },
      });
      return (res.data ?? []) as IshiharaPlate[];
    },
  });

export const useQuerySignalCategories = () =>
  useQuery({
    queryKey: ["mobile-signal-categories"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/traffic-signals/categories");
      return (res.data ?? []) as SignalCategory[];
    },
  });

export const useQuerySignals = (categoryId?: string, search?: string) =>
  useQuery({
    queryKey: ["mobile-signals", categoryId ?? "all", search ?? ""],
    queryFn: async () => {
      const res: any = await api.get("/mobile/traffic-signals", {
        params: { category: categoryId || undefined, search: search || undefined, limit: 100 },
      });
      return (res.data ?? []) as SignalItem[];
    },
  });

export const useQueryEmergencyNumbers = () =>
  useQuery({
    queryKey: ["mobile-emergency-numbers"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/emergency-numbers");
      return (res.data ?? []) as EmergencyItem[];
    },
  });

export interface CarouselItem {
  carousel_id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  link_text: string;
}

export const useQueryCarousels = () =>
  useQuery({
    queryKey: ["mobile-carousels"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/carousels");
      return (res.data ?? []) as CarouselItem[];
    },
  });

export interface NewsItem {
  news_id: string;
  title: string;
  content: string;
  tag: "NEWS" | "NOTICE" | "SCHEDULE" | "UPDATE";
  image: string;
  published_at: string;
}

export interface SentNotification {
  notification_id: string;
  title: string;
  message: string;
  sent_at: string;
}

// Notifications the admin sent (by push and email), newest first.
export const useQueryNotifications = (limit = 20) =>
  useQuery({
    queryKey: ["mobile-notifications", limit],
    queryFn: async () => {
      const res: any = await api.get("/mobile/notifications", {
        params: { limit },
      });
      return (res.data ?? []) as SentNotification[];
    },
  });

export const useQueryNews = (tag?: string, limit = 50) =>
  useQuery({
    queryKey: ["mobile-news", tag ?? "all", limit],
    queryFn: async () => {
      const res: any = await api.get("/mobile/news", {
        params: { tag: tag || undefined, limit },
      });
      return (res.data ?? []) as NewsItem[];
    },
  });

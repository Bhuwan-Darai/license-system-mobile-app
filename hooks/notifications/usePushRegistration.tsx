import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/auth";
import { isPushSupported, registerDevice } from "@/utils/push";

/**
 * Registers the device at app start-up once the user is signed in, and opens
 * the news tab when a notification is tapped. Render it once, inside AuthProvider.
 */
export function usePushRegistration() {
  const { user } = useAuth();
  const router = useRouter();
  const userKey = user ? JSON.stringify(user) : null;

  useEffect(() => {
    if (!userKey) return;
    registerDevice().catch((e) => console.warn("Push registration failed", e));
  }, [userKey]);

  useEffect(() => {
    if (!isPushSupported) return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string };
      if (data?.type === "news") router.push("/(tabs)/news");
    });
    return () => sub.remove();
  }, [router]);
}

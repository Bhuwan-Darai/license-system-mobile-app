import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/axios";

// Expo Go can't do remote push (SDK 53+). Push is only used in production
// builds and development builds (dev client), so skip everything in Expo Go.
export const isPushSupported =
  Platform.OS !== "web" &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// Show notifications that arrive while the app is open.
if (isPushSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const DEVICE_ID_KEY = "device_id";

/** A stable id for this install: the OS device id, or a generated one as a fallback. */
export async function getDeviceId(): Promise<string> {
  try {
    const os =
      Platform.OS === "android"
        ? Application.getAndroidId()
        : Platform.OS === "ios"
          ? await Application.getIosIdForVendorAsync()
          : null;
    if (os) return os;
  } catch {
    // fall through to the generated id
  }
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function getExpoPushToken(): Promise<string | null> {
  // push tokens only exist on real devices
  if (!isPushSupported || !Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("Push notifications: missing EAS projectId (extra.eas.projectId in app.json)");
    return null;
  }
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

/** Sends this device's push token to the backend for the signed-in user. */
export async function registerDevice(): Promise<void> {
  const pushToken = await getExpoPushToken();
  if (!pushToken) return;
  await api.post("/mobile/devices", {
    device_id: await getDeviceId(),
    push_token: pushToken,
    platform: Platform.OS,
  });
}

/** Stops pushes to this device; call before signing out. */
export async function unregisterDevice(): Promise<void> {
  if (!isPushSupported) return;
  await api.delete("/mobile/devices", { params: { device_id: await getDeviceId() } });
}

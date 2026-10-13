import { usePushRegistration } from "@/hooks/notifications/usePushRegistration";

// Renders nothing; it only runs the push-token registration at start-up.
export default function PushRegistration() {
  usePushRegistration();
  return null;
}

import Splash from "@/components/ui/Loading";
import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the session check (/auth/me) before deciding where to go.
  if (isLoading) {
    return <Splash />;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}

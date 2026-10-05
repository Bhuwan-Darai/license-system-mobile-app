import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { refetch } = useAuth();

  const { isAuthenticated, refetch: refetchAuth } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      refetchAuth();
    }
  }, [isAuthenticated]);

  return <Redirect href="/login" />;
}

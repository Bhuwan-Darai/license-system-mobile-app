import api from "@/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export type AuthStatus =
  | "unauthenticated"
  | "otp-pending"
  | "authenticated"
  | "guest";

interface User {
  phone?: string;
  isGuest: boolean;
}

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  isLoading: boolean;
  tempPhone: string | null;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("unauthenticated");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempPhone, setTempPhone] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: userInfo = [],
    isLoading: getUserLoading,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const response = await api.get("/auth/me");
        return response.data.data;
      } catch (error) {
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // enabled: !!localStorage.getItem("token"),
  });

  // Simulate loading session from local storage on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStatus("unauthenticated");
        setUser(null);
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const sendOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to send OTP code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const cleanedPhone = phone.trim();
      if (cleanedPhone.length === 10) {
        setTempPhone(cleanedPhone);
        setStatus("otp-pending");
      } else {
        throw new Error("Enter a valid 10-digit mobile number");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation: accept "1234" as the valid OTP code for testing
      if (otp === "1234") {
        setUser({ phone: tempPhone || "9800000000", isGuest: false });
        setStatus("authenticated");
        setTempPhone(null);
        return true;
      } else {
        throw new Error("Invalid code. Use 1234 for testing.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    try {
      // Simulate resending OTP
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`OTP resent to ${tempPhone}`);
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    setUser({ isGuest: true });
    setStatus("guest");
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(null);
      setTempPhone(null);
      setStatus("unauthenticated");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const payload = {
        Username: name,
        Email: email,
        Password: password,
      };
      console.log("Sign-up payload in context:", payload);
      await api.post("/auth/register", payload);
    } catch(error){
      setIsLoading(false)
      console.log("error", error);
    }finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to initiate forgot password process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Password reset OTP sent to ${email}`);
      // You might want to set some state here to indicate that the OTP has been sent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isLoading,
        tempPhone,
        sendOtp,
        verifyOtp,
        resendOtp,
        continueAsGuest,
        signOut,
        signUp,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

import api from "@/axios";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

export type AuthStatus =
  | "unauthenticated"
  | "otp-pending"
  | "authenticated"
  | "guest";

// interface User {
//   phone?: string;
//   isGuest: boolean;
// }

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  isLoading: boolean;
  tempPhone: string | null;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (credentials:{otpCode: string,email:string}) => Promise<any>;
  resendOtp: (email:string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<any>;
  loginLoading: boolean;
  isAuthenticated: boolean;
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
  // const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempPhone, setTempPhone] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading:userFetching,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/me");
        return response.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: {email:string, password:string}) => {
      console.log("credentials",credentials)
      const data = await api.post("/auth/login/mobile", credentials);
      if (data.success) {
        await refetch();
        Alert.alert(data.message || "Login successful!");
        router.push("/verify-otp")
      } else {
        Alert.alert(data.message || "Login failed.");
      }
    }
  });

  // Simulate loading session from local storage on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await refetch();
        setStatus("unauthenticated");
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

  const verifyOtp = async (credentials:{otpCode: string,email:string}): Promise<any> => {
    setIsLoading(true);
    const payload = {
      email:credentials?.email,
      otp:credentials?.otpCode
    }
    try {
      // Simulate API call to verify OTP
     const res =  await api.post("/auth/verify-otp/mobile", payload);
     console.log("otp verify",res);
     if (res?.success){
       await refetch();
       router.replace("/(tabs)")
     }
    }catch(error){
      console.warn(error)
      throw error;
      }
     finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email:string) => {
    setIsLoading(true);
    try {
      const payload = {
        email:email,
      }
      // Simulate resending OTP
      const res = await api.post("/auth/resend-otp/mobile", payload)
      console.log("res", res);
    }
    catch(error) {
       console.log("error",error)
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    // setUser({ isGuest: true });
    setStatus("guest");
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // setUser(null);
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
     const res =  await api.post("/auth/register", payload);
     console.log("res context",res)
      return res
    } catch(error){
      setIsLoading(false);
      console.log("error",error);
      throw error;
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

  const isAuthenticated = !!user;

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
        login: loginMutation.mutateAsync,
        loginLoading: loginMutation.isPending,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

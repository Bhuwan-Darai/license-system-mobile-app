import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import { useAuth } from '@/context/auth';
import { DrawerProvider } from '@/components/Drawer/DrawerContext';
import { useColors } from "@/hooks/use-theme";

export default function TabLayout() {
  const BrandColors = useColors();

  const { user, status, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BrandColors.paper }}>
  //       <ActivityIndicator size="large" color={BrandColors.crimson} />
  //     </View>
  //   );
  // }

  // Allow 'authenticated' or 'guest' users to access the tabs.
  // Redirect 'unauthenticated' or 'otp-pending' to root / login.
  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!user) {
    return <Redirect href="/login" />; // Send to login which handles OTP verification
  }

  return (
    <DrawerProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.crimson,
        tabBarInactiveTintColor: BrandColors.inkSoft,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BrandColors.card,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: BrandColors.line,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "document-text" : "document-text-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "list" : "list-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "newspaper" : "newspaper-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="service"
        options={{
          title: 'Service',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "construct" : "construct-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "person" : "person-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
    </DrawerProvider>
  );
}

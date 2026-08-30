import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

export default function TabLayout() {
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.crimson,
        tabBarInactiveTintColor: BrandColors.inkSoft,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: BrandColors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
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
          title: 'Category',
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
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={22} name={focused ? "menu" : "menu-outline"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

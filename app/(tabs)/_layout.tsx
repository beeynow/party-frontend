"use client";

import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@/components/theme-context";
import { LayoutDashboard, DollarSign, User } from "lucide-react-native"; // Changed Settings to User icon

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.headerBorder,
        },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: "Home",
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.primary : colors.textSecondary,
                fontSize: 12,
              }}
            >
              Overview
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <LayoutDashboard
              color={focused ? colors.primary : colors.textSecondary}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.primary : colors.textSecondary,
                fontSize: 12,
              }}
            >
              Earnings
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <DollarSign
              color={focused ? colors.primary : colors.textSecondary}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Changed name from settings to profile
        options={{
          title: "Profile", // Changed title from Settings to Profile
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? colors.primary : colors.textSecondary,
                fontSize: 12,
              }}
            >
              Profile
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <User
              color={focused ? colors.primary : colors.textSecondary}
              size={24}
            />
          ), // Changed icon to User
        }}
      />
    </Tabs>
  );
}

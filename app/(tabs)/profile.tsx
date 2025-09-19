"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { removeAuthToken } from "@/lib/auth-storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  LogOut,
  Settings,
  HelpCircle,
  Info,
  Sun,
  Moon,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const { colors, theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await removeAuthToken();
            toast({
              title: "Logged Out",
              description: "You have been logged out successfully",
              variant: "success",
            });
            router.replace("/login");
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to logout. Please try again.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <View style={themedStyles.headerContent}>
          <View>
            <Text style={themedStyles.title}>Profile</Text>
          </View>
          <TouchableOpacity
            style={themedStyles.themeToggle}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {theme === "dark" ? (
              <Sun color={colors.textPrimary} size={24} />
            ) : (
              <Moon color={colors.textPrimary} size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <User color={colors.primary} size={20} />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.infoText}>
              View your account details in the Overview tab to see your referral
              stats and earnings.
            </Text>
          </CardContent>
        </Card>

        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Settings color={colors.primary} size={20} />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.infoText}>
              Notification preferences, theme settings, and other app
              configurations coming soon.
            </Text>
          </CardContent>
        </Card>

        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <HelpCircle color={colors.primary} size={20} />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.infoText}>
              Need help? Contact our support team for assistance with your
              account or referral program.
            </Text>
          </CardContent>
        </Card>

        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Info color={colors.primary} size={20} />
              About AdsMoney
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.infoText}>
              Version 1.0.0{"\n"}
              Build your network and earn rewards through our referral program.
            </Text>
          </CardContent>
        </Card>

        <View style={themedStyles.logoutSection}>
          <Button
            onPress={handleLogout}
            loading={loading}
            style={themedStyles.logoutButton}
          >
            <LogOut color="white" size={16} />
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // paddingTop: 30,
      // paddingBottom: 30,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingBottom: 5,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    themeToggle: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.textSecondary,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    footer: {
      paddingBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    card: {
      margin: 20,
      marginTop: 12,
    },
    cardTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    logoutSection: {
      padding: 20,
      paddingTop: 0,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
  });

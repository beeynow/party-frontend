"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { removeAuthToken, getUserData } from "@/lib/auth-storage";
import { Card, CardContent } from "@/components/ui/card";
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
  Bell,
  Shield,
  Star,
  Award,
  ChevronRight,
  Mail,
  Calendar,
  Coins,
  Users,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface UserProfile {
  name: string;
  email: string;
  coins: number;
  referralCount: number;
  joinDate: string;
  is_admin: boolean;
  verified: boolean;
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { colors, theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setUserProfile({
          name: userData.name || "Anonymous User",
          email: userData.email || "",
          coins: userData.coins || 0,
          referralCount: userData.referralCount || 0,
          joinDate: userData.createdAt || new Date().toISOString(),
          is_admin: userData.is_admin || false,
          verified: userData.verified || false,
        });
      }
    } catch (error) {
      console.log("Error loading user profile:", error);
    }
  };

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

  const handleMenuPress = (item: string) => {
    toast({
      title: item,
      description: "This feature is coming soon!",
    });
  };

  const getProfileImage = () => {
    // Generate consistent avatar based on user's name or email
    const seed = userProfile?.name || userProfile?.email || "default";
    const hash = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = hash % 100;
    return `https://images.unsplash.com/photo-${
      1500000000000 + avatarIndex
    }?w=120&h=120&fit=crop&crop=face`;
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <View style={themedStyles.headerLeft}>
          <Text style={themedStyles.headerTitle}>Profile</Text>
        </View>
        <View style={themedStyles.headerRight}>
          <TouchableOpacity
            style={themedStyles.themeToggle}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {theme === "dark" ? (
              <Sun color={colors.primary} size={24} />
            ) : (
              <Moon color={colors.primary} size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={themedStyles.profileCard}>
          <CardContent style={themedStyles.profileContent}>
            <View style={themedStyles.profileImageContainer}>
              <View style={themedStyles.view}>
                <View style={themedStyles.friendAvatar}>
                  <Text style={themedStyles.friendInitial}>
                    {userProfile?.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              </View>
              {userProfile?.verified && (
                <View style={themedStyles.verifiedBadge}>
                  <Shield color={colors.primary} size={16} />
                </View>
              )}
              {userProfile?.is_admin && (
                <View style={themedStyles.adminBadge}>
                  <Star color={colors.primary} size={14} />
                </View>
              )}
            </View>

            <View style={themedStyles.profileInfo}>
              <Text style={themedStyles.profileName}>
                {userProfile?.name || "Loading..."}
              </Text>
              <Text style={themedStyles.profileEmail}>
                {userProfile?.email || ""}
              </Text>

              <View style={themedStyles.badgeContainer}>
                {userProfile?.is_admin && (
                  <View style={themedStyles.badge}>
                    <Shield color={colors.primary} size={12} />
                    <Text style={themedStyles.badgeText}>Admin</Text>
                  </View>
                )}
                {userProfile?.verified && (
                  <View style={themedStyles.badge}>
                    <Award color="#10B981" size={12} />
                    <Text style={themedStyles.badgeText}>Verified</Text>
                  </View>
                )}
              </View>

              <View style={themedStyles.joinDateContainer}>
                <Calendar color={colors.textSecondary} size={14} />
                <Text style={themedStyles.joinDate}>
                  Joined{" "}
                  {userProfile?.joinDate
                    ? formatJoinDate(userProfile.joinDate)
                    : "Recently"}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <View style={themedStyles.statsRow}>
          <Card style={themedStyles.statCard}>
            <CardContent style={themedStyles.statContent}>
              <View style={themedStyles.statIcon}>
                <Coins color={colors.primary} size={24} />
              </View>
              <Text style={themedStyles.statNumber}>
                {userProfile?.coins || 0}
              </Text>
              <Text style={themedStyles.statLabel}>Total Coins</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.statCard}>
            <CardContent style={themedStyles.statContent}>
              <View style={themedStyles.statIcon}>
                <Users color="#10B981" size={24} />
              </View>
              <Text style={[themedStyles.statNumber, { color: "#10B981" }]}>
                {userProfile?.referralCount || 0}
              </Text>
              <Text style={themedStyles.statLabel}>Referrals</Text>
            </CardContent>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={themedStyles.menuSection}>
          <TouchableOpacity
            style={themedStyles.menuItem}
            onPress={() => router.push("/accountsettings")}
          >
            <View style={themedStyles.menuItemLeft}>
              <View style={themedStyles.menuIcon}>
                <User color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={themedStyles.menuTitle}>Account Settings</Text>
                <Text style={themedStyles.menuSubtitle}>
                  Manage your account details
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.menuItem}
            onPress={() => router.push("/notifications")}
          >
            <View style={themedStyles.menuItemLeft}>
              <View style={themedStyles.menuIcon}>
                <Bell color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={themedStyles.menuTitle}>Notifications</Text>
                <Text style={themedStyles.menuSubtitle}>
                  Configure your notifications
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.menuItem}
            onPress={() => router.push("/appsettings")}
          >
            <View style={themedStyles.menuItemLeft}>
              <View style={themedStyles.menuIcon}>
                <Settings color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={themedStyles.menuTitle}>App Settings</Text>
                <Text style={themedStyles.menuSubtitle}>
                  Theme, language & preferences
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.menuItem}
            onPress={() => router.push("/helper")}
          >
            <View style={themedStyles.menuItemLeft}>
              <View style={themedStyles.menuIcon}>
                <HelpCircle color={colors.primary} size={20} />
              </View>
              <View>
                <Text style={themedStyles.menuTitle}>Help & Support</Text>
                <Text style={themedStyles.menuSubtitle}>
                  Get help and contact support
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={themedStyles.logoutSection}>
          <Button
            onPress={handleLogout}
            loading={loading}
            style={themedStyles.logoutButton}
          >
            <View style={themedStyles.logoutContent}>
              <LogOut color="white" size={20} />
              <Text style={themedStyles.logoutText}>Logout</Text>
            </View>
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
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    headerRight: {
      flexDirection: "row",
      gap: 12,
    },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    profileCard: {
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      overflow: "hidden",
    },
    profileContent: {
      padding: 24,
      alignItems: "center",
    },
    profileImageContainer: {
      position: "relative",
      marginBottom: 16,
    },
    friendInitial: {
      color: colors.textPrimary,
      fontSize: 45,
      fontWeight: "bold",
    },
    view: {
      paddingLeft: 20,
    },
    friendAvatar: {
      width: 90,
      height: 90,
      borderColor: colors.primary,
      shadowOpacity: 0.15,
      shadowColor: colors.primary,
      borderWidth: 1.5,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginRight: 16,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: colors.primary,
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    adminBadge: {
      position: "absolute",
      top: 70,
      right: 10,
      backgroundColor: "#FFD700",
      borderRadius: 12,
      padding: 4,
      borderWidth: 2,
      borderColor: colors.cardBackground,
    },
    profileInfo: {
      alignItems: "center",
      gap: 8,
    },
    profileName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
    },
    profileEmail: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    badgeContainer: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    joinDateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },
    joinDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginTop: 20,
      gap: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
    },
    statContent: {
      padding: 20,
      alignItems: "center",
      gap: 8,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    menuSection: {
      marginTop: 32,
      paddingHorizontal: 20,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 16,
      marginBottom: 12,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 16,
    },
    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    logoutSection: {
      paddingHorizontal: 20,
      paddingVertical: 32,
    },
    logoutButton: {
      backgroundColor: colors.red,
      borderRadius: 16,
      paddingVertical: 16,
    },
    logoutContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
  });

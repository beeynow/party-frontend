"use client";

import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { getDashboardData } from "@/lib/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";

export default function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await getDashboardData();
        if (result.message) {
          setData(result);
        } else {
          toast({
            title: "Authentication Required",
            description:
              result.message || "Please log in to view the dashboard.",
            variant: "destructive",
          });
          router.replace("/login");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.message ||
            "Failed to fetch dashboard data. Please log in again.",
          variant: "destructive",
        });
        router.replace("/login");
      } finally {
        setLoading(false);
        // Start animations after data loads
        Animated.stagger(100, [
          Animated.timing(headerAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnim1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnim2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cardAnim3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    fetchDashboardData();
  }, [router, toast, headerAnim, cardAnim1, cardAnim2, cardAnim3]);

  const themedStyles = getThemedStyles(colors);

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={themedStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const headerAnimatedStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  const cardAnimatedStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <Animated.View style={[themedStyles.header, headerAnimatedStyle]}>
        <Text style={themedStyles.headerTitle}>AdsMoney Dashboard</Text>
      </Animated.View>
      <View style={themedStyles.contentContainer}>
        <Animated.View
          style={[
            themedStyles.card,
            themedStyles.welcomeCard,
            cardAnimatedStyle(cardAnim1),
          ]}
        >
          <CardHeader>
            <CardTitle>Welcome, {data?.user?.name || "User"}!</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.cardContentText}>
              Your journey to maximizing ad revenue starts here.
            </Text>
            <Text style={themedStyles.cardDescriptionText}>
              Explore your performance metrics and manage your campaigns.
            </Text>
          </CardContent>
        </Animated.View>

        <Animated.View
          style={[themedStyles.metricCard, cardAnimatedStyle(cardAnim2)]}
        >
          <CardHeader>
            <CardTitle style={themedStyles.metricTitle}>
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.metricValue}>$1,234.56</Text>
            <Text style={themedStyles.metricDescription}>Last 30 days</Text>
          </CardContent>
        </Animated.View>

        <Animated.View
          style={[themedStyles.metricCard, cardAnimatedStyle(cardAnim3)]}
        >
          <CardHeader>
            <CardTitle style={themedStyles.metricTitle}>
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.metricValue}>12</Text>
            <Text style={themedStyles.metricDescription}>
              Currently running
            </Text>
          </CardContent>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 16,
      gap: 16,
    },
    card: {
      width: "100%",
    },
    welcomeCard: {
      marginBottom: 8,
    },
    cardContentText: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    cardDescriptionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    metricCard: {
      width: "100%",
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metricTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    metricValue: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.primary,
    },
    metricDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

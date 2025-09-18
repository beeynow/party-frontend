import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { getDashboardData } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import { Coins, Users, Trophy, Gift } from "lucide-react-native";

interface UserData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  coins: number;
  referralCount: number;
  referralHistory: Array<{
    referredUser: string;
    referredUserName: string;
    referredUserEmail: string;
    coinsEarned: number;
    referredAt: string;
  }>;
}

export default function OverviewScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getDashboardData();
      if (result.user) {
        setUserData(result.user);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const themedStyles = getThemedStyles(colors);

  if (loading && !userData) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Text style={themedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={themedStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={themedStyles.header}>
        <Text style={themedStyles.welcomeText}>Welcome back,</Text>
        <Text style={themedStyles.nameText}>{userData?.name}!</Text>
      </View>

      <View style={themedStyles.statsGrid}>
        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <Coins color={colors.primary} size={24} />
            </View>
            <Text style={themedStyles.statValue}>{userData?.coins || 0}</Text>
            <Text style={themedStyles.statLabel}>Total Coins</Text>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <Users color={colors.primary} size={24} />
            </View>
            <Text style={themedStyles.statValue}>
              {userData?.referralCount || 0}
            </Text>
            <Text style={themedStyles.statLabel}>Referrals</Text>
          </CardContent>
        </Card>
      </View>

      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>
            <Gift color={colors.primary} size={20} />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themedStyles.referralCodeContainer}>
            <Text style={themedStyles.referralCode}>
              {userData?.referralCode}
            </Text>
            <Text style={themedStyles.referralCodeDesc}>
              Share this code with friends to earn 10 coins for each successful
              referral!
            </Text>
          </View>
        </CardContent>
      </Card>

      {userData?.referralHistory && userData.referralHistory.length > 0 && (
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userData.referralHistory.slice(0, 3).map((referral, index) => (
              <View key={index} style={themedStyles.referralItem}>
                <View style={themedStyles.referralInfo}>
                  <Text style={themedStyles.referralName}>
                    {referral.referredUserName}
                  </Text>
                  <Text style={themedStyles.referralDate}>
                    {new Date(referral.referredAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={themedStyles.referralReward}>
                  <Text style={themedStyles.rewardText}>
                    +{referral.coinsEarned}
                  </Text>
                  <Coins color={colors.primary} size={16} />
                </View>
              </View>
            ))}
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    header: {
      padding: 20,
      paddingBottom: 0,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    nameText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textSecondary,
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
      marginTop: 20,
    },
    statCard: {
      flex: 1,
    },
    statContent: {
      alignItems: "center",
      paddingVertical: 16,
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    statLabel: {
      fontSize: 14,
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
    referralCodeContainer: {
      alignItems: "center",
      paddingVertical: 16,
    },
    referralCode: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 8,
    },
    referralCodeDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    referralItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    referralInfo: {
      flex: 1,
    },
    referralName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    referralDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    referralReward: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rewardText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
  });

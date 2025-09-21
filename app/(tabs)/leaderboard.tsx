"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { getReferralLeaderboard, getTotalUserCount } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Trophy,
  Medal,
  CircleCheckBig,
  Crown,
  Users,
  Settings,
  BarChart3,
  UserCheck,
  Shield,
  Upload,
  ShieldCheck,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react-native";
import { getUserData } from "@/lib/auth-storage";
import AdminUploadScreen from "../../components/AdminUploadScreen";

const { width: screenWidth } = Dimensions.get("window");

interface LeaderboardEntry {
  rank: number;
  name: string;
  referralCode: string;
  totalReferrals: number;
  totalCoins: number;
}

type AdminStats = {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  verificationRate: number;
  registrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
};

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "leaderboard" | "dashboard" | "upload"
  >("leaderboard");
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    activeUsers: 0,
    verificationRate: 0,
    registrations: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
  });

  const { colors } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const userData = await getUserData();
        const adminStatus =
          userData?.is_admin === true && userData?.adminConfirmed === true;
        setIsAdmin(adminStatus);

        await fetchLeaderboard();
        if (adminStatus) {
          await fetchAdminStats();
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const result = await getTotalUserCount();
      if (result.success) {
        setAdminStats({
          totalUsers: result.totalUsers || 0,
          verifiedUsers: result.verifiedUsers || 0,
          activeUsers: result.activeUsers || 0,
          verificationRate: Number(result.verificationRate) || 0,
          registrations: result.registration || {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      });
    }
  };

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const result = await getReferralLeaderboard(20);

      if (result.success && result.data) {
        const leaderboardData = result.data.leaderboard || result.data;

        if (Array.isArray(leaderboardData)) {
          const mappedData = leaderboardData.map(
            (item: any, index: number) => ({
              rank: index + 1,
              name: item.name || item.username || "Anonymous",
              referralCode: item.referralCode || item.code || "",
              totalReferrals: item.totalReferrals || item.referrals || 0,
              totalCoins: item.totalCoins || item.coins || 0,
            })
          );
          setLeaderboard(mappedData);
        } else {
          setLeaderboard([]);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load leaderboard",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load leaderboard",
        variant: "destructive",
      });
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await fetchLeaderboard(true);
    if (isAdmin) {
      await fetchAdminStats();
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <View style={[themedStyles.rankBadge, themedStyles.goldBadge]}>
          <Crown color="#FFD700" size={16} />
        </View>
      );
    } else if (rank === 2) {
      return (
        <View style={[themedStyles.rankBadge, themedStyles.silverBadge]}>
          <Medal color="#C0C0C0" size={16} />
        </View>
      );
    } else if (rank === 3) {
      return (
        <View style={[themedStyles.rankBadge, themedStyles.bronzeBadge]}>
          <Medal color="#CD7F32" size={16} />
        </View>
      );
    } else {
      return (
        <View style={[themedStyles.rankBadge, themedStyles.defaultBadge]}>
          <Text style={themedStyles.rankText}>{rank}</Text>
        </View>
      );
    }
  };

  const getAvatarUrl = (name: string) => {
    // Generate consistent avatar based on name
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % 100;
    return `https://images.unsplash.com/photo-${
      1500000000000 + avatarIndex
    }?w=50&h=50&fit=crop&crop=face`;
  };

  const renderLeaderboard = () => (
    <View style={themedStyles.leaderboardContainer}>
      <View style={themedStyles.pageHeader}>
        <View style={themedStyles.headerIcon}>
          <Trophy color={colors.primary} size={28} />
        </View>
        <Text style={themedStyles.pageTitle}>Leaderboard</Text>
        <Text style={themedStyles.pageSubtitle}>Top performers this month</Text>
      </View>

      {leaderboard.length > 0 ? (
        <View style={themedStyles.leaderboardList}>
          {leaderboard.slice(0, 3).map((entry) => (
            <Card
              key={entry.rank}
              //@ts-ignore
              style={[
                themedStyles.podiumCard,
                entry.rank === 1 && themedStyles.firstPlaceCard,
              ]}
            >
              <CardContent style={themedStyles.podiumContent}>
                <View style={themedStyles.podiumLeft}>
                  {getRankBadge(entry.rank)}
                  <Image
                    source={{ uri: getAvatarUrl(entry.name) }}
                    style={themedStyles.podiumAvatar}
                  />
                </View>
                <View style={themedStyles.podiumCenter}>
                  <Text style={themedStyles.podiumName}>{entry.name}</Text>
                  <View style={themedStyles.podiumStats}>
                    <View style={themedStyles.statPill}>
                      <Zap color={colors.primary} size={14} />
                      <Text style={themedStyles.statValue}>
                        {entry.totalCoins}
                      </Text>
                    </View>
                    <View style={themedStyles.statPill}>
                      <Users color={colors.textSecondary} size={14} />
                      <Text style={themedStyles.statValue}>
                        {entry.totalReferrals}
                      </Text>
                    </View>
                  </View>
                </View>
                {entry.rank === 1 && (
                  <View style={themedStyles.crownIcon}>
                    <Crown color="#FFD700" size={24} />
                  </View>
                )}
              </CardContent>
            </Card>
          ))}

          <View style={themedStyles.restOfList}>
            {leaderboard.slice(3).map((entry) => (
              <Card key={entry.rank} style={themedStyles.regularCard}>
                <CardContent style={themedStyles.regularContent}>
                  <View style={themedStyles.regularLeft}>
                    {getRankBadge(entry.rank)}
                    <Image
                      source={{ uri: getAvatarUrl(entry.name) }}
                      style={themedStyles.regularAvatar}
                    />
                    <Text style={themedStyles.regularName}>{entry.name}</Text>
                  </View>
                  <View style={themedStyles.regularRight}>
                    <Text style={themedStyles.regularCoins}>
                      {entry.totalCoins}
                    </Text>
                    <Text style={themedStyles.regularReferrals}>
                      {entry.totalReferrals} refs
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      ) : (
        <Card style={themedStyles.emptyCard}>
          <CardContent style={themedStyles.emptyContent}>
            <Trophy color={colors.textSecondary} size={64} />
            <Text style={themedStyles.emptyTitle}>No rankings yet</Text>
            <Text style={themedStyles.emptyDescription}>
              Be the first to climb the leaderboard!
            </Text>
          </CardContent>
        </Card>
      )}
    </View>
  );

  const renderAdminDashboard = () => (
    <View style={themedStyles.adminContainer}>
      <View style={themedStyles.pageHeader}>
        <View style={themedStyles.headerIcon}>
          <Shield color={colors.primary} size={28} />
        </View>
        <Text style={themedStyles.pageTitle}>Admin Dashboard</Text>
        <Text style={themedStyles.pageSubtitle}>
          System overview & management
        </Text>
      </View>

      <View style={themedStyles.statsGrid}>
        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <Users color={colors.primary} size={24} />
            </View>
            <Text style={themedStyles.statNumber}>{adminStats.totalUsers}</Text>
            <Text style={themedStyles.statLabel}>Total Users</Text>
            <View style={themedStyles.statTrend}>
              <TrendingUp color="#10B981" size={14} />
              <Text style={themedStyles.trendText}>
                +{adminStats.registrations.today} today
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <CircleCheckBig color="#10B981" size={24} />
            </View>
            <Text style={[themedStyles.statNumber, { color: "#10B981" }]}>
              {adminStats.verifiedUsers}
            </Text>
            <Text style={themedStyles.statLabel}>Verified</Text>
            <View style={themedStyles.statTrend}>
              <Star color="#F59E0B" size={14} />
              <Text style={themedStyles.trendText}>
                {adminStats.verificationRate}% rate
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <BarChart3 color="#F59E0B" size={24} />
            </View>
            <Text style={[themedStyles.statNumber, { color: "#F59E0B" }]}>
              {adminStats.activeUsers}
            </Text>
            <Text style={themedStyles.statLabel}>Active</Text>
            <View style={themedStyles.statTrend}>
              <Zap color={colors.primary} size={14} />
              <Text style={themedStyles.trendText}>This week</Text>
            </View>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIcon}>
              <UserCheck color="#8B5CF6" size={24} />
            </View>
            <Text style={[themedStyles.statNumber, { color: "#8B5CF6" }]}>
              {adminStats.registrations.thisMonth}
            </Text>
            <Text style={themedStyles.statLabel}>This Month</Text>
            <View style={themedStyles.statTrend}>
              <TrendingUp color="#10B981" size={14} />
              <Text style={themedStyles.trendText}>
                +{adminStats.registrations.thisWeek} week
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      <View style={themedStyles.quickActions}>
        <TouchableOpacity style={themedStyles.actionButton}>
          <Settings color={colors.textPrimary} size={20} />
          <Text style={themedStyles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploadScreen = () => (
    <View style={themedStyles.uploadContainer}>
      <View style={themedStyles.pageHeader}>
        <View style={themedStyles.headerIcon}>
          <Upload color={colors.primary} size={28} />
        </View>
        <Text style={themedStyles.pageTitle}>Content Upload</Text>
        <Text style={themedStyles.pageSubtitle}>Manage posts and media</Text>
      </View>
      <AdminUploadScreen />
    </View>
  );

  const themedStyles = getThemedStyles(colors);

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Trophy color={colors.primary} size={48} />
        <Text style={themedStyles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      {isAdmin && (
        <View style={themedStyles.tabBar}>
          <TouchableOpacity
            style={[
              themedStyles.tab,
              activeTab === "leaderboard" && themedStyles.activeTab,
            ]}
            onPress={() => setActiveTab("leaderboard")}
          >
            <Trophy
              color={
                activeTab === "leaderboard"
                  ? colors.primary
                  : colors.textSecondary
              }
              size={20}
            />
            <Text
              style={[
                themedStyles.tabText,
                activeTab === "leaderboard" && themedStyles.activeTabText,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              themedStyles.tab,
              activeTab === "dashboard" && themedStyles.activeTab,
            ]}
            onPress={() => setActiveTab("dashboard")}
          >
            <Shield
              color={
                activeTab === "dashboard"
                  ? colors.primary
                  : colors.textSecondary
              }
              size={20}
            />
            <Text
              style={[
                themedStyles.tabText,
                activeTab === "dashboard" && themedStyles.activeTabText,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              themedStyles.tab,
              activeTab === "upload" && themedStyles.activeTab,
            ]}
            onPress={() => setActiveTab("upload")}
          >
            <Upload
              color={
                activeTab === "upload" ? colors.primary : colors.textSecondary
              }
              size={20}
            />
            <Text
              style={[
                themedStyles.tabText,
                activeTab === "upload" && themedStyles.activeTabText,
              ]}
            >
              Upload
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={themedStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isAdmin ? (
          <>
            {activeTab === "leaderboard" && renderLeaderboard()}
            {activeTab === "dashboard" && renderAdminDashboard()}
            {activeTab === "upload" && renderUploadScreen()}
          </>
        ) : (
          renderLeaderboard()
        )}
      </ScrollView>
    </View>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      gap: 16,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 16,
      paddingTop: 50,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 8,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: "600",
    },
    pageHeader: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    headerIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    pageSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    leaderboardContainer: {
      paddingHorizontal: 16,
    },
    leaderboardList: {
      gap: 16,
    },
    podiumCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      overflow: "hidden",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    firstPlaceCard: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.primary + "08",
    },
    podiumContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
    },
    podiumLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    podiumCenter: {
      flex: 1,
      marginLeft: 16,
    },
    podiumName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    podiumStats: {
      flexDirection: "row",
      gap: 12,
    },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    crownIcon: {
      position: "absolute",
      top: -12,
      right: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 8,
      elevation: 4,
    },
    podiumAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    goldBadge: {
      backgroundColor: "#FFD700",
    },
    silverBadge: {
      backgroundColor: "#C0C0C0",
    },
    bronzeBadge: {
      backgroundColor: "#CD7F32",
    },
    defaultBadge: {
      backgroundColor: colors.primary,
    },
    rankText: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.white,
    },
    restOfList: {
      gap: 8,
    },
    regularCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
    },
    regularContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    regularLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    regularRight: {
      alignItems: "flex-end",
    },
    regularAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
    },
    regularName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
    },
    regularCoins: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    regularReferrals: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    emptyCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      marginHorizontal: 16,
    },
    emptyContent: {
      alignItems: "center",
      paddingVertical: 64,
      paddingHorizontal: 32,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    emptyDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    adminContainer: {
      paddingHorizontal: 16,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      width: (screenWidth - 48) / 2,
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
    statTrend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    trendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    quickActions: {
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 16,
      gap: 16,
    },
    actionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    uploadContainer: {
      paddingHorizontal: 16,
    },
  });

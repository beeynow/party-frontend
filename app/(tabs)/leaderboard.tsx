"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
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
} from "lucide-react-native";
import { getUserData } from "@/lib/auth-storage";
import AdminUploadScreen from "../../components/AdminUploadScreen"; // Assuming AdminUploadScreen is imported correctly

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

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUploadScreen, setShowUploadScreen] = useState(false); // Added navigation state for admin screens
  const { colors } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const userData = await getUserData();

        console.log("[v0] User data loaded:", userData);
        const adminStatus =
          userData?.is_admin === true && userData?.adminConfirmed === true;
        setIsAdmin(adminStatus);
        console.log("[v0] Admin status:", adminStatus);

        await fetchLeaderboard();

        if (adminStatus) {
          await fetchAdminStats();
        }
      } catch (error) {
        console.log("[v0] Error loading user data:", error);
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
      console.log("[v0] Admin stats result:", result);

      if (result.success) {
        setAdminStats({
          totalUsers: result.totalUsers || 0,
          verifiedUsers: result.verifiedUsers || 0,
          activeUsers: result.activeUsers || 0,
          verificationRate: Number(result.verificationRate) || 0, // in case it's a string like "66.67"
          registrations: result.registration || {
            // match the state shape
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
        });
      }
    } catch (error) {
      console.log("[v0] Failed to fetch admin stats:", error);
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
      console.log("[v0] Leaderboard result:", result);

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
      console.log("[v0] Leaderboard fetch error:", error);
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

  const renderAvatar = (name: string, rank: number) => {
    const getRankColor = (rank: number) => {
      if (rank <= 3) return colors.primary;
      return colors.textSecondary;
    };

    return (
      <View style={[themedStyles.avatar, { borderColor: getRankColor(rank) }]}>
        <Text style={themedStyles.avatarText}>{rank}</Text>
        {rank === 1 && (
          <View style={themedStyles.crownContainer}>
            <Crown color={colors.textPrimary} size={14} />
          </View>
        )}
      </View>
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown color={colors.primary} size={18} />;
      case 2:
        return <Medal color="#C0C0C0" size={18} />;
      case 3:
        return <Medal color="#CD7F32" size={18} />;
      default:
        return (
          <View
            style={[
              themedStyles.rankBadge,
              {
                backgroundColor: rank <= 10 ? "#8B5CF6" : colors.textSecondary,
              },
            ]}
          >
            <Text style={themedStyles.rankBadgeText}>{rank}</Text>
          </View>
        );
    }
  };

  const renderLeaderboardRows = () => {
    if (leaderboard.length === 0) return null;

    return (
      <View style={themedStyles.leaderboardContainer}>
        {leaderboard.map((entry) => {
          const isTopTen = entry.rank <= 10;
          const isTopThree = entry.rank <= 3;

          const cardStyle = [themedStyles.modernCard];

          if (isTopThree) {
            //@ts-ignore
            cardStyle.push(themedStyles.topThreeCard);
          } else if (isTopTen) {
            //@ts-ignore
            cardStyle.push(themedStyles.topTenCard);
          }

          return (
            <Card
              key={entry.rank}
              //@ts-ignore
              style={cardStyle}
            >
              <CardContent style={themedStyles.cardContent}>
                <View style={themedStyles.leftSection}>
                  <View
                    //@ts-ignore
                    style={themedStyles.rankContainer}
                  >
                    {getRankIcon(entry.rank)}
                  </View>
                  {renderAvatar(entry.name, entry.rank)}
                </View>

                <View style={themedStyles.centerSection}>
                  <Text
                    style={[
                      themedStyles.userName,
                      isTopThree && themedStyles.topThreeUserName,
                    ]}
                  >
                    {entry.name}
                  </Text>
                </View>

                <View style={themedStyles.rightSection}>
                  <View style={themedStyles.statsContainer}>
                    <Text
                      style={[
                        themedStyles.coinsText,
                        isTopThree && themedStyles.topThreeCoinsText,
                      ]}
                    >
                      {entry.totalCoins}
                    </Text>
                    <Text style={themedStyles.coinsLabel}>coins</Text>
                  </View>
                  <View style={themedStyles.referralsContainer}>
                    <Users
                      color={isTopThree ? colors.primary : colors.textPrimary}
                      size={14}
                    />
                    <Text
                      style={[
                        themedStyles.referralsText,
                        isTopThree && themedStyles.topThreeReferralsText,
                      ]}
                    >
                      {entry.totalReferrals}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          );
        })}
      </View>
    );
  };

  const renderAdminDashboard = () => {
    return (
      <View style={themedStyles.adminContainer}>
        <View style={themedStyles.header}>
          <Shield color={colors.primary} size={32} />
          <Text style={themedStyles.headerTitle}>ADMIN DASHBOARD</Text>
          <Text style={themedStyles.headerSubtitle}>
            System Overview & Management
          </Text>
        </View>

        <View style={themedStyles.adminStatsContainer}>
          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <Users color={colors.primary} size={24} />
              <Text style={themedStyles.adminStatNumber}>
                {adminStats.totalUsers}
              </Text>
              <Text style={themedStyles.adminStatLabel}>Total Users</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <CircleCheckBig color="#10B981" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#10B981" }]}
              >
                {adminStats.verifiedUsers}
              </Text>
              <Text style={themedStyles.adminStatLabel}>Verified Users</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <BarChart3 color="#F59E0B" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#F59E0B" }]}
              >
                {adminStats.activeUsers}
              </Text>
              <Text style={themedStyles.adminStatLabel}>Active Users</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <ShieldCheck color="#e708c2ff" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#e708c2ff" }]}
              >
                {adminStats.verificationRate}%
              </Text>
              <Text style={themedStyles.adminStatLabel}>Verified Rate</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <UserCheck color="#f50b1fff" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#f50b1fff" }]}
              >
                {adminStats.registrations.today}
              </Text>
              <Text style={themedStyles.adminStatLabel}>registered Today</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <UserCheck color="#f50b1fff" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#f50b1fff" }]}
              >
                {adminStats.registrations.thisMonth}
              </Text>
              <Text style={themedStyles.adminStatLabel}>This Month</Text>
            </CardContent>
          </Card>

          <Card style={themedStyles.adminStatCard}>
            <CardContent style={themedStyles.adminStatContent}>
              <UserCheck color="#f50b1fff" size={24} />
              <Text
                style={[themedStyles.adminStatNumber, { color: "#f50b1fff" }]}
              >
                {adminStats.registrations.thisWeek}
              </Text>
              <Text style={themedStyles.adminStatLabel}>This Week</Text>
            </CardContent>
          </Card>
        </View>

        <View style={themedStyles.adminActionsContainer}>
          <TouchableOpacity style={themedStyles.adminActionButton}>
            <Settings color={colors.textPrimary} size={20} />
            <Text style={themedStyles.adminActionText}>System Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.adminActionButton}
            onPress={() => setShowUploadScreen(!showUploadScreen)}
          >
            <Upload color={colors.textPrimary} size={20} />
            <Text style={themedStyles.adminActionText}>
              {showUploadScreen ? "Hide Upload" : "Upload Post"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.adminActionButton}
            onPress={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Trophy color={colors.textPrimary} size={20} />
            <Text style={themedStyles.adminActionText}>
              {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
            </Text>
          </TouchableOpacity>
        </View>

        {showUploadScreen && (
          <View style={themedStyles.adminUploadSection}>
            <AdminUploadScreen />
          </View>
        )}

        {showLeaderboard && (
          <View style={themedStyles.adminLeaderboardSection}>
            <View style={themedStyles.leaderboardHeader}>
              <Trophy color={colors.primary} size={24} />
              <Text style={themedStyles.leaderboardSectionTitle}>
                LEADERBOARD
              </Text>
              <Text style={themedStyles.leaderboardSectionSubtitle}>
                Top performers this month
              </Text>
            </View>

            {leaderboard.length > 0 ? (
              renderLeaderboardRows()
            ) : (
              <Card style={themedStyles.emptyCard}>
                <CardContent style={themedStyles.emptyState}>
                  <Trophy color={colors.textSecondary} size={48} />
                  <Text style={themedStyles.emptyTitle}>No Data Available</Text>
                  <Text style={themedStyles.emptyDesc}>
                    Be the first to start referring friends and appear on the
                    leaderboard!
                  </Text>
                </CardContent>
              </Card>
            )}
          </View>
        )}
      </View>
    );
  };

  const themedStyles = getThemedStyles(colors);

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Text style={themedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <ScrollView
        style={themedStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isAdmin ? (
          renderAdminDashboard()
        ) : (
          <>
            <View style={themedStyles.header}>
              <Text style={themedStyles.headerTitle}>LEADERBOARD</Text>
              <Text style={themedStyles.headerSubtitle}>
                Top performers this month
              </Text>
            </View>

            {leaderboard.length > 0 ? (
              renderLeaderboardRows()
            ) : (
              <Card style={themedStyles.emptyCard}>
                <CardContent style={themedStyles.emptyState}>
                  <Trophy color={colors.textSecondary} size={48} />
                  <Text style={themedStyles.emptyTitle}>No Data Available</Text>
                  <Text style={themedStyles.emptyDesc}>
                    Be the first to start referring friends and appear on the
                    leaderboard!
                  </Text>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    adminContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    adminStatsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
      gap: 12,
    },
    adminStatCard: {
      width: "48%",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    adminStatContent: {
      alignItems: "center",
      padding: 20,
      gap: 8,
    },
    adminStatNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    adminStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    adminActionsContainer: {
      gap: 12,
    },
    adminActionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    adminActionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
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
    },
    loadingText: {
      color: colors.textPrimary,
      fontSize: 16,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textPrimary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    leaderboardContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    modernCard: {
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topThreeCard: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.cardBackground,
      shadowOpacity: 0.2,
      shadowColor: colors.primary,
    },
    topTenCard: {
      borderColor: "#8B5CF6",
      borderWidth: 1.5,
      backgroundColor: colors.cardBackground,
      shadowOpacity: 0.15,
      shadowColor: "#8B5CF6",
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      width: 80,
    },
    centerSection: {
      flex: 1,
    },
    rightSection: {
      alignItems: "flex-end",
      minWidth: 80,
    },
    userName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    topThreeUserName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    statsContainer: {
      alignItems: "flex-end",
      marginBottom: 4,
    },
    coinsText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    topThreeCoinsText: {
      fontSize: 20,
      color: colors.textPrimary,
    },
    coinsLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    referralsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    referralsText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    topThreeReferralsText: {
      color: colors.textPrimary,
      fontWeight: "700",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      position: "relative",
    },
    avatarText: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    crownContainer: {
      position: "absolute",
      top: -6,
      right: -4,
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 2,
    },
    emptyCard: {
      margin: 20,
      backgroundColor: colors.cardBackground,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    rankBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    rankBadgeText: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    adminLeaderboardSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    leaderboardHeader: {
      alignItems: "center",
      marginBottom: 20,
      gap: 8,
    },
    leaderboardSectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      letterSpacing: 1,
    },
    leaderboardSectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    adminUploadSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

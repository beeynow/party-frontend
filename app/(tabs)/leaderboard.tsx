"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { getReferralLeaderboard } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Medal, Crown, Users } from "lucide-react-native";

interface LeaderboardEntry {
  rank: number;
  name: string;
  referralCode: string;
  totalReferrals: number;
  totalCoins: number;
}

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  const renderAvatar = (name: string, rank: number) => {
    const getRankColor = (rank: number) => {
      if (rank <= 3) return colors.primary;
      if (rank <= 10) return colors.textPrimary;
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
        return <Crown color="#FFD700" size={18} />;
      case 2:
        return <Medal color="#C0C0C0" size={18} />;
      case 3:
        return <Medal color="#CD7F32" size={18} />;
      default:
        return (
          <View
            style={[
              themedStyles.rankBadge,
              { backgroundColor: rank <= 10 ? "#8B5CF6" : "#6B7280" },
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
                {/* Left section with rank and avatar */}
                <View style={themedStyles.leftSection}>
                  {/* <View style={themedStyles.rankContainer}>
                    {getRankIcon(entry.rank)}
                  </View> */}
                  {renderAvatar(entry.name, entry.rank)}
                </View>

                {/* Center section with name */}
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

                {/* Right section with coins and referrals */}
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

  const themedStyles = getThemedStyles(colors);

  if (loading && leaderboard.length === 0) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Text style={themedStyles.loadingText}>Loading leaderboard...</Text>
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
    rankContainer: {
      marginRight: 12,
    },
    centerSection: {
      flex: 1,
      // paddingHorizontal: 12,
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
  });

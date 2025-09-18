import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { getReferralLeaderboard } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Medal, Award, Users, Coins } from "lucide-react-native";

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
      if (result.data) {
        setLeaderboard(result.data);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy color="#FFD700" size={24} />;
      case 2:
        return <Medal color="#C0C0C0" size={24} />;
      case 3:
        return <Award color="#CD7F32" size={24} />;
      default:
        return (
          <View
            style={[
              themedStyles.rankNumber,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[themedStyles.rankText, { color: colors.primary }]}>
              {rank}
            </Text>
          </View>
        );
    }
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
    <ScrollView
      style={themedStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>🏆 Leaderboard</Text>
        <Text style={themedStyles.subtitle}>
          Top referrers in the community
        </Text>
      </View>

      {leaderboard.length > 0 ? (
        <View style={themedStyles.leaderboardContainer}>
          {leaderboard.slice(0, 3).map((entry) => (
            <Card
              key={entry.rank}
              //@ts-ignore
              style={[
                themedStyles.topCard,
                entry.rank === 1 && themedStyles.goldCard,
                entry.rank === 2 && themedStyles.silverCard,
                entry.rank === 3 && themedStyles.bronzeCard,
              ]}
            >
              <CardContent style={themedStyles.topCardContent}>
                <View style={themedStyles.topCardHeader}>
                  {getRankIcon(entry.rank)}
                  <Text style={themedStyles.topName}>{entry.name}</Text>
                </View>
                <View style={themedStyles.topStats}>
                  <View style={themedStyles.topStat}>
                    <Users color={colors.primary} size={16} />
                    <Text style={themedStyles.topStatText}>
                      {entry.totalReferrals}
                    </Text>
                  </View>
                  <View style={themedStyles.topStat}>
                    <Coins color={colors.primary} size={16} />
                    <Text style={themedStyles.topStatText}>
                      {entry.totalCoins}
                    </Text>
                  </View>
                </View>
                <Text style={themedStyles.topCode}>
                  Code: {entry.referralCode}
                </Text>
              </CardContent>
            </Card>
          ))}

          {leaderboard.slice(3).map((entry) => (
            <Card key={entry.rank} style={themedStyles.regularCard}>
              <CardContent style={themedStyles.regularCardContent}>
                <View style={themedStyles.regularRank}>
                  {getRankIcon(entry.rank)}
                </View>
                <View style={themedStyles.regularInfo}>
                  <Text style={themedStyles.regularName}>{entry.name}</Text>
                  <Text style={themedStyles.regularCode}>
                    Code: {entry.referralCode}
                  </Text>
                </View>
                <View style={themedStyles.regularStats}>
                  <View style={themedStyles.regularStat}>
                    <Users color={colors.textSecondary} size={14} />
                    <Text style={themedStyles.regularStatText}>
                      {entry.totalReferrals}
                    </Text>
                  </View>
                  <View style={themedStyles.regularStat}>
                    <Coins color={colors.textSecondary} size={14} />
                    <Text style={themedStyles.regularStatText}>
                      {entry.totalCoins}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
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
    leaderboardContainer: {
      padding: 20,
      gap: 12,
    },
    topCard: {
      marginBottom: 8,
    },
    goldCard: {
      borderColor: "#FFD700",
      borderWidth: 2,
    },
    silverCard: {
      borderColor: "#C0C0C0",
      borderWidth: 2,
    },
    bronzeCard: {
      borderColor: "#CD7F32",
      borderWidth: 2,
    },
    topCardContent: {
      alignItems: "center",
      paddingVertical: 20,
    },
    topCardHeader: {
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    topName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    topStats: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 12,
    },
    topStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    topStatText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    topCode: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    regularCard: {
      marginBottom: 8,
    },
    regularCardContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 16,
    },
    regularRank: {
      width: 40,
      alignItems: "center",
    },
    rankNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    rankText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    regularInfo: {
      flex: 1,
    },
    regularName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    regularCode: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    regularStats: {
      gap: 8,
    },
    regularStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    regularStatText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyCard: {
      margin: 20,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Share,
  TouchableOpacity,
} from "react-native";
import { getReferralStats, getReferralHistory } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Copy, Users, Coins, Gift, Clock } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalCoinsEarned: number;
  referralHistory: Array<{
    referredUser: {
      name: string;
      email: string;
      createdAt: string;
    };
    referredUserName: string;
    referredUserEmail: string;
    coinsEarned: number;
    referredAt: string;
  }>;
  referralLink: string;
}

export default function ReferralsScreen() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  const fetchReferralData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getReferralStats();
      if (result.data) {
        setStats(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load referral data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const onRefresh = () => {
    fetchReferralData(true);
  };

  const handleShare = async () => {
    if (!stats) return;

    const shareMessage = `🎉 Join AdsMoney using my referral code: ${stats.referralCode}\n\nSign up now and we both earn rewards! 💰\n\n${stats.referralLink}`;

    try {
      await Share.share({
        message: shareMessage,
        title: "Join AdsMoney with my referral!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share referral link",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      variant: "success",
    });
  };

  const themedStyles = getThemedStyles(colors);

  if (loading && !stats) {
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
        <Text style={themedStyles.title}>Referral Program</Text>
        <Text style={themedStyles.subtitle}>
          Earn 10 coins for each successful referral!
        </Text>
      </View>

      <View style={themedStyles.statsGrid}>
        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <Users color={colors.primary} size={24} />
            <Text style={themedStyles.statValue}>
              {stats?.totalReferrals || 0}
            </Text>
            <Text style={themedStyles.statLabel}>Total Referrals</Text>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <Coins color={colors.primary} size={24} />
            <Text style={themedStyles.statValue}>
              {stats?.totalCoinsEarned || 0}
            </Text>
            <Text style={themedStyles.statLabel}>Coins Earned</Text>
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
          <View style={themedStyles.referralSection}>
            <View style={themedStyles.codeContainer}>
              <Text style={themedStyles.referralCode}>
                {stats?.referralCode}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(stats?.referralCode || "", "Referral code")
                }
                style={themedStyles.copyButton}
              >
                <Copy color={colors.primary} size={16} />
              </TouchableOpacity>
            </View>

            <View style={themedStyles.linkContainer}>
              <Text style={themedStyles.linkLabel}>Referral Link:</Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(stats?.referralLink || "", "Referral link")
                }
                style={themedStyles.linkButton}
              >
                <Text style={themedStyles.linkText} numberOfLines={1}>
                  {stats?.referralLink}
                </Text>
                <Copy color={colors.primary} size={14} />
              </TouchableOpacity>
            </View>

            <Button onPress={handleShare} style={themedStyles.shareButton}>
              <Share2 color="white" size={16} />
              Share Referral Link
            </Button>
          </View>
        </CardContent>
      </Card>

      {stats?.referralHistory && stats.referralHistory.length > 0 && (
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Clock color={colors.primary} size={20} />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.referralHistory.map((referral, index) => (
              <View key={index} style={themedStyles.historyItem}>
                <View style={themedStyles.historyInfo}>
                  <Text style={themedStyles.historyName}>
                    {referral.referredUserName}
                  </Text>
                  <Text style={themedStyles.historyEmail}>
                    {referral.referredUserEmail}
                  </Text>
                  <Text style={themedStyles.historyDate}>
                    {new Date(referral.referredAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={themedStyles.historyReward}>
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

      {(!stats?.referralHistory || stats.referralHistory.length === 0) && (
        <Card style={themedStyles.card}>
          <CardContent style={themedStyles.emptyState}>
            <Users color={colors.textSecondary} size={48} />
            <Text style={themedStyles.emptyTitle}>No Referrals Yet</Text>
            <Text style={themedStyles.emptyDesc}>
              Share your referral code with friends to start earning coins!
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
      paddingVertical: 20,
      gap: 8,
    },
    statValue: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
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
    referralSection: {
      gap: 16,
    },
    codeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 12,
    },
    referralCode: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.primary,
      letterSpacing: 3,
    },
    copyButton: {
      padding: 8,
    },
    linkContainer: {
      gap: 8,
    },
    linkLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    linkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkText: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
    },
    shareButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
    },
    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyInfo: {
      flex: 1,
    },
    historyName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    historyEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    historyReward: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rewardText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
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

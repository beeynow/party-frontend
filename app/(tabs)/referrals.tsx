"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Share,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { getReferralStats } from "@/lib/api";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Copy,
  Users,
  Gift,
  QrCode,
  Share2,
  Coins,
  TrendingUp,
  Calendar,
  Zap,
  Star,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { Card, CardContent } from "@/components/ui/card";

const { width: screenWidth } = Dimensions.get("window");

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
    coinsEarned: number;
    referredAt: string;
  }>;
  referralLink: string;
  qrCodeUrl?: string;
}

export default function ReferralsScreen() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  const fetchReferralData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getReferralStats();
      if (result.success && result.data) {
        const mappedStats: ReferralStats = {
          referralCode: result.data.user?.referralCode || "",
          totalReferrals: result.data.totals?.referralCount || 0,
          totalCoinsEarned: result.data.totals?.totalCoins || 0,
          referralHistory: result.data.history?.referralHistory || [],
          referralLink: result.data.sharing?.referralLink || "",
          qrCodeUrl: result.data.sharing?.qrCodeUrl || "",
        };

        setStats(mappedStats);
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

    const shareMessage = `🚀 Join Party-Support using my referral code: ${stats.referralCode}\n\n💰 Sign up now and we both earn rewards!\n\n🔗 ${stats.referralLink}`;

    try {
      await Share.share({
        message: shareMessage,
        title: "Join Party-Support with my referral!",
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
      title: "Copied! 📋",
      description: `${type} copied to clipboard`,
      variant: "success",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAvatarUrl = (name: string) => {
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % 100;
    return `https://images.unsplash.com/photo-${
      1500000000000 + avatarIndex
    }?w=50&h=50&fit=crop&crop=face`;
  };

  const themedStyles = getThemedStyles(colors);

  if (loading && !stats) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Gift color={colors.primary} size={48} />
        <Text style={themedStyles.loadingText}>
          Loading your referral stats...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={themedStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={themedStyles.header}>
        <View style={themedStyles.headerContent}>
          <View style={themedStyles.headerIcon}>
            <Gift color={colors.primary} size={28} />
          </View>
          <Text style={themedStyles.headerTitle}>Earn & Refer</Text>
          <Text style={themedStyles.headerSubtitle}>
            Share with friends and earn together
          </Text>
        </View>
        <TouchableOpacity
          style={themedStyles.shareButton}
          onPress={handleShare}
        >
          <Share2 color={colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={themedStyles.statsContainer}>
        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIconContainer}>
              <Coins color={colors.primary} size={24} />
            </View>
            <Text style={themedStyles.statNumber}>
              {stats?.totalCoinsEarned || 0}
            </Text>
            <Text style={themedStyles.statLabel}>Total Earned</Text>
            <View style={themedStyles.statTrend}>
              <TrendingUp color="#10B981" size={14} />
              <Text style={themedStyles.trendText}>Coins</Text>
            </View>
          </CardContent>
        </Card>

        <Card style={themedStyles.statCard}>
          <CardContent style={themedStyles.statContent}>
            <View style={themedStyles.statIconContainer}>
              <Users color="#10B981" size={24} />
            </View>
            <Text style={[themedStyles.statNumber, { color: "#10B981" }]}>
              {stats?.totalReferrals || 0}
            </Text>
            <Text style={themedStyles.statLabel}>Friends Referred</Text>
            <View style={themedStyles.statTrend}>
              <Star color="#F59E0B" size={14} />
              <Text style={themedStyles.trendText}>Total</Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* QR Code Section */}
      <Card style={themedStyles.qrCard}>
        <CardContent style={themedStyles.qrContent}>
          <View style={themedStyles.qrHeader}>
            <TouchableOpacity
              style={themedStyles.qrToggle}
              onPress={() => setShowQR(!showQR)}
            >
              <QrCode color={colors.primary} size={24} />
              <Text style={themedStyles.qrToggleText}>
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {showQR && (
            <View style={themedStyles.qrSection}>
              <View style={themedStyles.qrCodeContainer}>
                {stats?.qrCodeUrl ? (
                  <Image
                    source={{ uri: stats.qrCodeUrl }}
                    style={themedStyles.qrImage}
                    resizeMode="contain"
                  />
                ) : stats?.referralLink ? (
                  <QRCode
                    value={stats.referralLink}
                    size={160}
                    backgroundColor={colors.cardBackground}
                    color={colors.textPrimary}
                  />
                ) : (
                  <View style={themedStyles.qrPlaceholder}>
                    <QrCode color={colors.textSecondary} size={48} />
                    <Text style={themedStyles.qrPlaceholderText}>
                      No QR code available
                    </Text>
                  </View>
                )}
              </View>
              <Text style={themedStyles.qrDescription}>
                Let friends scan this code to join instantly!
              </Text>
            </View>
          )}

          {/* Referral Code Section */}
          <View style={themedStyles.codeSection}>
            <Text style={themedStyles.codeLabel}>Your Referral Code</Text>
            <View style={themedStyles.codeContainer}>
              <View style={themedStyles.codeDisplay}>
                <Text style={themedStyles.referralCode}>
                  {stats?.referralCode || "LOADING..."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(stats?.referralCode || "", "Referral code")
                }
                style={themedStyles.copyButton}
              >
                <Copy color={colors.white} size={18} />
              </TouchableOpacity>
            </View>
            <Text style={themedStyles.codeDescription}>
              Share this code and earn 10 coins for each successful referral! 🎉
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Referral History */}
      {stats?.referralHistory && stats.referralHistory.length > 0 ? (
        <View style={themedStyles.historySection}>
          <View style={themedStyles.sectionHeader}>
            <View style={themedStyles.sectionIcon}>
              <Users color={colors.primary} size={20} />
            </View>
            <Text style={themedStyles.sectionTitle}>Your Referrals</Text>
            <Text style={themedStyles.sectionCount}>
              {stats.referralHistory.length}
            </Text>
          </View>

          <View style={themedStyles.historyList}>
            {stats.referralHistory.map((referral, index) => (
              <Card key={index} style={themedStyles.historyCard}>
                <CardContent style={themedStyles.historyContent}>
                  <View style={themedStyles.historyLeft}>
                    <Image
                      source={{
                        uri: getAvatarUrl(
                          referral.referredUser?.name || "User"
                        ),
                      }}
                      style={themedStyles.historyAvatar}
                    />
                    <View style={themedStyles.historyInfo}>
                      <Text style={themedStyles.historyName}>
                        {referral.referredUser?.name || "Unknown User"}
                      </Text>
                      <View style={themedStyles.historyDateContainer}>
                        <Calendar color={colors.textSecondary} size={12} />
                        <Text style={themedStyles.historyDate}>
                          {formatDate(referral.referredAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={themedStyles.historyRight}>
                    <View style={themedStyles.earningsContainer}>
                      <Zap color={colors.primary} size={16} />
                      <Text style={themedStyles.earningsAmount}>
                        +{referral.coinsEarned}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      ) : (
        <Card style={themedStyles.emptyCard}>
          <CardContent style={themedStyles.emptyContent}>
            <View style={themedStyles.emptyIcon}>
              <Users color={colors.textSecondary} size={48} />
            </View>
            <Text style={themedStyles.emptyTitle}>No referrals yet</Text>
            <Text style={themedStyles.emptyDescription}>
              Start sharing your code to see your earnings and referrals here!
            </Text>
            <TouchableOpacity
              style={themedStyles.emptyAction}
              onPress={handleShare}
            >
              <Share2 color={colors.primary} size={20} />
              <Text style={themedStyles.emptyActionText}>Share Now</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      )}

      {/* Bottom Spacing */}
      <View style={themedStyles.bottomSpacing} />
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
      gap: 16,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 24,
    },
    headerContent: {
      flex: 1,
      alignItems: "center",
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
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    shareButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      right: 20,
      top: 70,
    },
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 24,
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
    statIconContainer: {
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
    },
    trendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    qrCard: {
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
    },
    qrContent: {
      padding: 24,
    },
    qrHeader: {
      alignItems: "center",
      marginBottom: 20,
    },
    qrToggle: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      gap: 8,
    },
    qrToggleText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    qrSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    qrCodeContainer: {
      padding: 20,
      backgroundColor: colors.background,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.primary + "30",
    },
    qrImage: {
      width: 160,
      height: 160,
    },
    qrPlaceholder: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    qrPlaceholderText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    qrDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      fontWeight: "500",
    },
    codeSection: {
      alignItems: "center",
    },
    codeLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    codeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    codeDisplay: {
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    referralCode: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      letterSpacing: 3,
      fontFamily: "monospace",
    },
    copyButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    codeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: "80%",
    },
    historySection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      flex: 1,
    },
    sectionCount: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    historyList: {
      gap: 12,
    },
    historyCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
    },
    historyContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    historyLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    historyAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.primary + "50",
    },
    historyInfo: {
      flex: 1,
    },
    historyName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    historyDateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    historyRight: {
      alignItems: "flex-end",
    },
    earningsContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
    },
    earningsAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    emptyCard: {
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
    },
    emptyContent: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 32,
      gap: 16,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
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
      marginBottom: 8,
    },
    emptyAction: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      gap: 8,
    },
    emptyActionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    bottomSpacing: {
      height: 32,
    },
  });

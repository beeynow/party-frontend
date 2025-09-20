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
} from "react-native";
import { getReferralStats } from "@/lib/api";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Users, Gift, QrCode } from "lucide-react-native";
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
  const { colors } = useTheme();
  const { toast } = useToast();
  const qrCodeRef = useRef<any>(null);

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
          qrCodeUrl: result.data.sharing?.qrCodeUrl || "", // <-- add this
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

    const shareMessage = `Join AdsMoney using my referral code: ${stats.referralCode}\n\nSign up now and we both earn rewards!\n\n${stats.referralLink}`;

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

  function ReferralQRCode({ qrCodeUrl }: { qrCodeUrl: string }) {
    if (!qrCodeUrl) {
      return <Text>No QR code available</Text>;
    }

    return (
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Image
          source={{ uri: qrCodeUrl }}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
        <Text style={{ marginTop: 10 }}>Scan this QR to join with my code</Text>
      </View>
    );
  }

  const handleShareQrCode = async () => {
    if (!stats?.qrCodeUrl) {
      toast({
        title: "Error",
        description: "No QR code available to share",
        variant: "destructive",
      });
      return;
    }

    try {
      await Share.share({
        message: `Join AdsMoney using my referral link!\n\n${stats.referralLink}`,
        url: stats.qrCodeUrl, // Share QR image if available
        title: "My Referral QR Code",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share QR code",
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
        <View style={themedStyles.headerTop}>
          <Text style={themedStyles.title}>Earn Money By Refer</Text>
          <TouchableOpacity
            style={themedStyles.referButton}
            onPress={handleShareQrCode}
          >
            <Text style={themedStyles.referButtonText}>Refer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={themedStyles.referSection}>
        <View style={themedStyles.referCard}>
          <View style={themedStyles.QrCode}>
            {stats?.qrCodeUrl ? (
              <Image
                source={{ uri: stats.qrCodeUrl }}
                style={{ width: 180, height: 180 }}
                resizeMode="contain"
              />
            ) : stats?.referralLink ? (
              <QRCode value={stats.referralLink} size={180} />
            ) : (
              <Text>No referral link available</Text>
            )}
          </View>

          <Text style={themedStyles.referTitle}>Refer a friend</Text>
          <Text style={themedStyles.referSubtitle}>
            Share your referral code and earn 10 coins for each successful
            referral!
          </Text>
          <View style={themedStyles.codeContainer}>
            <Text style={themedStyles.codeLabel}>Your Code:</Text>
            <View style={themedStyles.codeBox}>
              <Text style={themedStyles.referralCode}>
                {stats?.referralCode}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(stats?.referralCode || "", "Referral code")
                }
                style={themedStyles.copyButton}
              >
                <Copy color={colors.textPrimary} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {stats?.referralHistory && stats.referralHistory.length > 0 && (
        <View style={themedStyles.friendsList}>
          {stats.referralHistory.map((referral, index) => (
            <View key={index} style={themedStyles.friendItem}>
              <View style={themedStyles.friendAvatar}>
                <Text style={themedStyles.friendInitial}>
                  {referral.referredUser?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <View style={themedStyles.friendInfo}>
                <Text style={themedStyles.friendName}>
                  {referral.referredUser?.name || "Unknown"}
                </Text>
                <Text style={themedStyles.friendDate}>
                  {new Date(referral.referredAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View style={themedStyles.friendEarnings}>
                <Text style={themedStyles.earningsAmount}>
                  ${referral.coinsEarned}.00
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {(!stats?.referralHistory || stats.referralHistory.length === 0) && (
        <View style={themedStyles.emptyState}>
          <Users color={colors.textPrimary} size={48} />
          <Text style={themedStyles.emptyTitle}>No friends referred yet</Text>
          <Text style={themedStyles.emptyDesc}>
            Start sharing your code to see your earnings here!
          </Text>
        </View>
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
      color: colors.textPrimary,
      fontSize: 16,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    referButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    referButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 14,
    },
    referSection: {
      paddingHorizontal: 20,
      paddingVertical: -10,
      marginTop: 20,
    },
    referCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      width: "100%",
    },

    QrCode: {
      width: 200,
      height: 200,
      borderColor: colors.primary,
      borderWidth: 2,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      shadowOpacity: 0.15,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
      marginBottom: 20,
    },
    referIllustration: {
      width: 80,
      height: 80,
      borderColor: colors.primary,
      shadowOpacity: 0.15,
      shadowColor: colors.primary,
      borderWidth: 1.5,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    referTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    referSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    codeContainer: {
      width: "100%",
      alignItems: "center",
      gap: 12,
    },
    codeLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    codeBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: 12,
    },
    referralCode: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
      letterSpacing: 2,
      fontFamily: "monospace",
    },
    copyButton: {
      padding: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    friendsList: {
      paddingHorizontal: 20,
      marginTop: 24,
      gap: 12,
    },
    friendItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 4,
    },
    friendAvatar: {
      width: 48,
      height: 48,
      borderColor: colors.primary,
      shadowOpacity: 0.15,
      shadowColor: colors.primary,
      borderWidth: 1.5,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    friendInitial: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "bold",
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    friendDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    friendEarnings: {
      alignItems: "flex-end",
    },
    earningsAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

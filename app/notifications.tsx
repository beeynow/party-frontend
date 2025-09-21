"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  ChevronLeft,
  MessageSquare,
  Coins,
  Users,
  Trophy,
  Shield,
  Clock,
  Volume2,
  Smartphone,
  Mail,
  Settings,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  referralNotifications: boolean;
  coinsEarned: boolean;
  newReferrals: boolean;
  leaderboardUpdates: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    referralNotifications: true,
    coinsEarned: true,
    newReferrals: true,
    leaderboardUpdates: true,
    systemUpdates: true,
    marketingEmails: false,
    weeklyReports: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
  });

  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      // Simulate loading settings from storage/API
      // In real app, this would fetch from AsyncStorage or API
      console.log("Loading notification settings...");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      // Simulate saving to storage/API
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Save to AsyncStorage or send to API
      console.log(`Updated ${key}:`, value);

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved",
        variant: "success",
      });
    } catch (error) {
      // Revert on error
      setSettings(settings);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const updateQuietHours = (
    field: "enabled" | "startTime" | "endTime",
    value: any
  ) => {
    const newQuietHours = { ...settings.quietHours, [field]: value };
    updateSetting("quietHours", newQuietHours);
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Notifications</Text>
        <View style={themedStyles.headerRight} />
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* General Notifications */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Bell color={colors.primary} size={20} />
              General Notifications
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Smartphone color={colors.primary} size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Push Notifications
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Receive notifications on your device
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) =>
                  updateSetting("pushNotifications", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.pushNotifications
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Mail color={colors.primary} size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Email Notifications
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Get updates via email
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) =>
                  updateSetting("emailNotifications", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.emailNotifications
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <MessageSquare color={colors.primary} size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    SMS Notifications
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Receive text messages for important updates
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.smsNotifications}
                onValueChange={(value) =>
                  updateSetting("smsNotifications", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.smsNotifications
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Activity Notifications */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Coins color={colors.primary} size={20} />
              Activity Updates
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Coins color="#F59E0B" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Coins Earned</Text>
                  <Text style={themedStyles.settingDescription}>
                    Get notified when you earn coins
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.coinsEarned}
                onValueChange={(value) => updateSetting("coinsEarned", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.coinsEarned ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Users color="#10B981" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>New Referrals</Text>
                  <Text style={themedStyles.settingDescription}>
                    When someone joins using your code
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.newReferrals}
                onValueChange={(value) => updateSetting("newReferrals", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.newReferrals ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Trophy color="#8B5CF6" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Leaderboard Updates
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Changes in your ranking position
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.leaderboardUpdates}
                onValueChange={(value) =>
                  updateSetting("leaderboardUpdates", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.leaderboardUpdates
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Shield color={colors.red} size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>System Updates</Text>
                  <Text style={themedStyles.settingDescription}>
                    App updates and maintenance notices
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.systemUpdates}
                onValueChange={(value) => updateSetting("systemUpdates", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.systemUpdates ? colors.primary : colors.textSecondary
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Marketing & Reports */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Mail color={colors.primary} size={20} />
              Marketing & Reports
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Mail color="#EF4444" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Marketing Emails
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Promotional content and offers
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.marketingEmails}
                onValueChange={(value) =>
                  updateSetting("marketingEmails", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.marketingEmails
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Clock color="#06B6D4" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Weekly Reports</Text>
                  <Text style={themedStyles.settingDescription}>
                    Summary of your weekly activity
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.weeklyReports}
                onValueChange={(value) => updateSetting("weeklyReports", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.weeklyReports ? colors.primary : colors.textSecondary
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Sound & Vibration */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Volume2 color={colors.primary} size={20} />
              Sound & Vibration
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Volume2 color="#F59E0B" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Sound</Text>
                  <Text style={themedStyles.settingDescription}>
                    Play sound for notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting("soundEnabled", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.soundEnabled ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Smartphone color="#8B5CF6" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Vibration</Text>
                  <Text style={themedStyles.settingDescription}>
                    Vibrate device for notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) =>
                  updateSetting("vibrationEnabled", value)
                }
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.vibrationEnabled
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Clock color={colors.primary} size={20} />
              Quiet Hours
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Clock color="#6B7280" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Enable Quiet Hours
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Silence notifications during specific times
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.quietHours.enabled}
                onValueChange={(value) => updateQuietHours("enabled", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.quietHours.enabled
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>

            {settings.quietHours.enabled && (
              <View style={themedStyles.quietHoursSettings}>
                <View style={themedStyles.timeRow}>
                  <View style={themedStyles.timeItem}>
                    <Text style={themedStyles.timeLabel}>Start Time</Text>
                    <TouchableOpacity style={themedStyles.timeButton}>
                      <Text style={themedStyles.timeText}>
                        {settings.quietHours.startTime}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={themedStyles.timeItem}>
                    <Text style={themedStyles.timeLabel}>End Time</Text>
                    <TouchableOpacity style={themedStyles.timeButton}>
                      <Text style={themedStyles.timeText}>
                        {settings.quietHours.endTime}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={themedStyles.quietHoursNote}>
                  You wont receive notifications during these hours, except for
                  critical alerts.
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Test Notification */}
        <Card style={themedStyles.testCard}>
          <CardContent style={themedStyles.testContent}>
            <TouchableOpacity
              style={themedStyles.testButton}
              onPress={() => {
                toast({
                  title: "Test Notification! 🔔",
                  description: "Your notifications are working perfectly!",
                  variant: "success",
                });
              }}
            >
              <Bell color={colors.primary} size={20} />
              <Text style={themedStyles.testButtonText}>Test Notification</Text>
            </TouchableOpacity>
            <Text style={themedStyles.testDescription}>
              Send a test notification to verify your settings
            </Text>
          </CardContent>
        </Card>

        <View style={themedStyles.bottomSpacing} />
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      flex: 1,
      textAlign: "center",
    },
    headerRight: {
      width: 40,
    },
    card: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
    },
    cardTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardContent: {
      padding: 20,
      paddingTop: 0,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    quietHoursSettings: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timeRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    timeItem: {
      flex: 1,
    },
    timeLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    timeButton: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    timeText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    quietHoursNote: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: "italic",
      textAlign: "center",
    },
    testCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    testContent: {
      padding: 20,
      alignItems: "center",
      gap: 12,
    },
    testButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    testButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
    testDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    bottomSpacing: {
      height: 32,
    },
  });

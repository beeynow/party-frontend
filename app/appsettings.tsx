"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Settings,
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  Shield,
  Database,
  Smartphone,
  Wifi,
  Download,
  Trash2,
  RefreshCw,
  ChevronRight,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppSettings {
  autoSync: boolean;
  dataUsage: "low" | "normal" | "high";
  cacheSize: number;
  offlineMode: boolean;
  language: string;
  region: string;
  biometricAuth: boolean;
  autoLock: boolean;
  debugMode: boolean;
}

export default function AppSettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    autoSync: true,
    dataUsage: "normal",
    cacheSize: 125, // MB
    offlineMode: false,
    language: "English",
    region: "United States",
    biometricAuth: false,
    autoLock: true,
    debugMode: false,
  });

  const { colors, theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      // Simulate saving to storage
      await new Promise((resolve) => setTimeout(resolve, 200));

      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
        variant: "success",
      });
    } catch (error) {
      setSettings(settings);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const clearCache = () => {
    Alert.alert(
      "Clear Cache",
      `This will free up ${settings.cacheSize} MB of storage. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setSettings((prev) => ({ ...prev, cacheSize: 0 }));
            toast({
              title: "Cache Cleared",
              description: "App cache has been cleared successfully",
              variant: "success",
            });
          },
        },
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all app settings to their default values. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSettings({
              autoSync: true,
              dataUsage: "normal",
              cacheSize: 0,
              offlineMode: false,
              language: "English",
              region: "United States",
              biometricAuth: false,
              autoLock: true,
              debugMode: false,
            });
            toast({
              title: "Settings Reset",
              description: "All settings have been reset to defaults",
              variant: "success",
            });
          },
        },
      ]
    );
  };

  const getDataUsageColor = (usage: string) => {
    switch (usage) {
      case "low":
        return "#10B981";
      case "normal":
        return "#F59E0B";
      case "high":
        return "#EF4444";
      default:
        return colors.textSecondary;
    }
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
        <Text style={themedStyles.headerTitle}>App Settings</Text>
        <View style={themedStyles.headerRight} />
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Sun color={colors.primary} size={20} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <TouchableOpacity
              style={themedStyles.settingItem}
              onPress={toggleTheme}
            >
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  {theme === "dark" ? (
                    <Sun color="#F59E0B" size={18} />
                  ) : (
                    <Moon color="#8B5CF6" size={18} />
                  )}
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Theme</Text>
                  <Text style={themedStyles.settingDescription}>
                    Currently using {theme === "dark" ? "dark" : "light"} theme
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={16} />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Globe color={colors.primary} size={20} />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <TouchableOpacity style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Globe color="#10B981" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Language</Text>
                  <Text style={themedStyles.settingDescription}>
                    {settings.language}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={16} />
            </TouchableOpacity>

            <TouchableOpacity style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Globe color="#8B5CF6" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Region</Text>
                  <Text style={themedStyles.settingDescription}>
                    {settings.region}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={16} />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Security */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Shield color={colors.primary} size={20} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Shield color="#EF4444" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>
                    Biometric Authentication
                  </Text>
                  <Text style={themedStyles.settingDescription}>
                    Use fingerprint or face ID to unlock
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.biometricAuth}
                onValueChange={(value) => updateSetting("biometricAuth", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.biometricAuth ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Smartphone color="#F59E0B" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Auto Lock</Text>
                  <Text style={themedStyles.settingDescription}>
                    Automatically lock when app goes to background
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoLock}
                onValueChange={(value) => updateSetting("autoLock", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.autoLock ? colors.primary : colors.textSecondary
                }
              />
            </View>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Database color={colors.primary} size={20} />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <RefreshCw color="#10B981" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Auto Sync</Text>
                  <Text style={themedStyles.settingDescription}>
                    Automatically sync data in background
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting("autoSync", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.autoSync ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <TouchableOpacity style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Wifi
                    color={getDataUsageColor(settings.dataUsage)}
                    size={18}
                  />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Data Usage</Text>
                  <Text style={themedStyles.settingDescription}>
                    {settings.dataUsage.charAt(0).toUpperCase() +
                      settings.dataUsage.slice(1)}{" "}
                    quality
                  </Text>
                </View>
              </View>
              <View style={themedStyles.dataUsageBadge}>
                <Text
                  style={[
                    themedStyles.dataUsageText,
                    { color: getDataUsageColor(settings.dataUsage) },
                  ]}
                >
                  {settings.dataUsage.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Download color="#8B5CF6" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Offline Mode</Text>
                  <Text style={themedStyles.settingDescription}>
                    Enable offline functionality
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.offlineMode}
                onValueChange={(value) => updateSetting("offlineMode", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.offlineMode ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <View style={themedStyles.cacheItem}>
              <View style={themedStyles.cacheInfo}>
                <Text style={themedStyles.cacheTitle}>Cache Storage</Text>
                <Text style={themedStyles.cacheSize}>
                  {settings.cacheSize} MB used
                </Text>
              </View>
              <TouchableOpacity
                style={themedStyles.clearCacheButton}
                onPress={clearCache}
                disabled={settings.cacheSize === 0}
              >
                <Trash2
                  color={
                    settings.cacheSize === 0 ? colors.textSecondary : colors.red
                  }
                  size={16}
                />
                <Text
                  style={[
                    themedStyles.clearCacheText,
                    {
                      color:
                        settings.cacheSize === 0
                          ? colors.textSecondary
                          : colors.red,
                    },
                  ]}
                >
                  Clear Cache
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Settings color={colors.primary} size={20} />
              Advanced
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingLeft}>
                <View style={themedStyles.settingIcon}>
                  <Settings color="#6B7280" size={18} />
                </View>
                <View style={themedStyles.settingText}>
                  <Text style={themedStyles.settingTitle}>Debug Mode</Text>
                  <Text style={themedStyles.settingDescription}>
                    Enable developer debugging features
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.debugMode}
                onValueChange={(value) => updateSetting("debugMode", value)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "50",
                }}
                thumbColor={
                  settings.debugMode ? colors.primary : colors.textSecondary
                }
              />
            </View>

            <TouchableOpacity
              style={themedStyles.resetItem}
              onPress={resetSettings}
            >
              <View style={themedStyles.settingIcon}>
                <RefreshCw color={colors.red} size={18} />
              </View>
              <View style={themedStyles.settingText}>
                <Text
                  style={[themedStyles.settingTitle, { color: colors.red }]}
                >
                  Reset All Settings
                </Text>
                <Text style={themedStyles.settingDescription}>
                  Restore all settings to default values
                </Text>
              </View>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card style={themedStyles.infoCard}>
          <CardContent style={themedStyles.infoContent}>
            <View style={themedStyles.infoItem}>
              <Text style={themedStyles.infoLabel}>App Version</Text>
              <Text style={themedStyles.infoValue}>1.0.0</Text>
            </View>
            <View style={themedStyles.infoItem}>
              <Text style={themedStyles.infoLabel}>Build Number</Text>
              <Text style={themedStyles.infoValue}>2024.01.15</Text>
            </View>
            <View style={themedStyles.infoItem}>
              <Text style={themedStyles.infoLabel}>Last Updated</Text>
              <Text style={themedStyles.infoValue}>January 15, 2024</Text>
            </View>
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
    dataUsageBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dataUsageText: {
      fontSize: 12,
      fontWeight: "600",
    },
    cacheItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cacheInfo: {
      flex: 1,
    },
    cacheTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    cacheSize: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    clearCacheButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    clearCacheText: {
      fontSize: 14,
      fontWeight: "500",
    },
    resetItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    infoCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    infoContent: {
      padding: 20,
    },
    infoItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    bottomSpacing: {
      height: 32,
    },
  });

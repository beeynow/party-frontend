"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Calendar,
  MapPin,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "@/lib/auth-storage";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  joinDate: string;
  verified: boolean;
  avatar?: string;
}

export default function AccountSettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        const userProfile: UserProfile = {
          name: userData.name || "Anonymous User",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          joinDate: userData.createdAt || new Date().toISOString(),
          verified: userData.verified || false,
          avatar:
            userData.avatar ||
            getProfileImage(userData.name || userData.email || "default"),
        };
        setProfile(userProfile);
        setEditedProfile(userProfile);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const getProfileImage = (seed: string) => {
    const hash = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = hash % 100;
    return `https://images.unsplash.com/photo-${
      1500000000000 + avatarIndex
    }?w=120&h=120&fit=crop&crop=face`;
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            toast({
              title: "Account Deletion",
              description: "Account deletion feature coming soon",
              variant: "destructive",
            });
          },
        },
      ]
    );
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
        <Text style={themedStyles.headerTitle}>Account Settings</Text>
        <TouchableOpacity
          style={themedStyles.editButton}
          onPress={() => {
            if (isEditing) {
              setEditedProfile(profile);
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <X color={colors.textPrimary} size={24} />
          ) : (
            <Edit3 color={colors.primary} size={24} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <Card style={themedStyles.card}>
          <CardContent style={themedStyles.profileSection}>
            <View style={themedStyles.avatarContainer}>
              <Image
                source={{ uri: profile?.avatar || getProfileImage("default") }}
                style={themedStyles.avatar}
              />
              {isEditing && (
                <TouchableOpacity style={themedStyles.cameraButton}>
                  <Camera color={colors.white} size={16} />
                </TouchableOpacity>
              )}
            </View>
            <View style={themedStyles.profileInfo}>
              <Text style={themedStyles.profileName}>{profile?.name}</Text>
              <Text style={themedStyles.profileEmail}>{profile?.email}</Text>
              {profile?.verified && (
                <View style={themedStyles.verifiedBadge}>
                  <Shield color={colors.primary} size={14} />
                  <Text style={themedStyles.verifiedText}>
                    Verified Account
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <User color={colors.primary} size={20} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Full Name</Text>
              <View style={themedStyles.inputContainer}>
                <User color={colors.textSecondary} size={16} />
                <TextInput
                  style={[
                    themedStyles.input,
                    !isEditing && themedStyles.disabledInput,
                  ]}
                  value={editedProfile?.name || ""}
                  onChangeText={(text) =>
                    setEditedProfile((prev) =>
                      prev ? { ...prev, name: text } : null
                    )
                  }
                  editable={isEditing}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Email Address</Text>
              <View style={themedStyles.inputContainer}>
                <Mail color={colors.textSecondary} size={16} />
                <TextInput
                  style={[themedStyles.input, themedStyles.disabledInput]}
                  value={editedProfile?.email || ""}
                  editable={false}
                  placeholder="Email cannot be changed"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Phone Number</Text>
              <View style={themedStyles.inputContainer}>
                <Phone color={colors.textSecondary} size={16} />
                <TextInput
                  style={[
                    themedStyles.input,
                    !isEditing && themedStyles.disabledInput,
                  ]}
                  value={editedProfile?.phone || ""}
                  onChangeText={(text) =>
                    setEditedProfile((prev) =>
                      prev ? { ...prev, phone: text } : null
                    )
                  }
                  editable={isEditing}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Location</Text>
              <View style={themedStyles.inputContainer}>
                <MapPin color={colors.textSecondary} size={16} />
                <TextInput
                  style={[
                    themedStyles.input,
                    !isEditing && themedStyles.disabledInput,
                  ]}
                  value={editedProfile?.location || ""}
                  onChangeText={(text) =>
                    setEditedProfile((prev) =>
                      prev ? { ...prev, location: text } : null
                    )
                  }
                  editable={isEditing}
                  placeholder="Enter your location"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={themedStyles.inputGroup}>
              <Text style={themedStyles.inputLabel}>Member Since</Text>
              <View style={themedStyles.inputContainer}>
                <Calendar color={colors.textSecondary} size={16} />
                <TextInput
                  style={[themedStyles.input, themedStyles.disabledInput]}
                  value={
                    profile?.joinDate
                      ? new Date(profile.joinDate).toLocaleDateString()
                      : ""
                  }
                  editable={false}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Save Button */}
        {isEditing && (
          <View style={themedStyles.saveSection}>
            <Button
              onPress={handleSaveProfile}
              loading={loading}
              style={themedStyles.saveButton}
            >
              <View style={themedStyles.buttonContent}>
                <Save color="white" size={18} />
                <Text style={themedStyles.buttonText}>Save Changes</Text>
              </View>
            </Button>
          </View>
        )}

        {/* Security Section */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Lock color={colors.primary} size={20} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <TouchableOpacity
              style={themedStyles.securityItem}
              onPress={() => setShowPasswordChange(!showPasswordChange)}
            >
              <Text style={themedStyles.securityText}>Change Password</Text>
              <ChevronLeft
                color={colors.textSecondary}
                size={16}
                style={{
                  transform: [
                    { rotate: showPasswordChange ? "270deg" : "180deg" },
                  ],
                }}
              />
            </TouchableOpacity>

            {showPasswordChange && (
              <View style={themedStyles.passwordSection}>
                <View style={themedStyles.inputGroup}>
                  <Text style={themedStyles.inputLabel}>Current Password</Text>
                  <View style={themedStyles.inputContainer}>
                    <Lock color={colors.textSecondary} size={16} />
                    <TextInput
                      style={themedStyles.input}
                      value={passwordData.currentPassword}
                      onChangeText={(text) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: text,
                        }))
                      }
                      placeholder="Enter current password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!showPasswords.current}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff color={colors.textSecondary} size={16} />
                      ) : (
                        <Eye color={colors.textSecondary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={themedStyles.inputGroup}>
                  <Text style={themedStyles.inputLabel}>New Password</Text>
                  <View style={themedStyles.inputContainer}>
                    <Lock color={colors.textSecondary} size={16} />
                    <TextInput
                      style={themedStyles.input}
                      value={passwordData.newPassword}
                      onChangeText={(text) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: text,
                        }))
                      }
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!showPasswords.new}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff color={colors.textSecondary} size={16} />
                      ) : (
                        <Eye color={colors.textSecondary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={themedStyles.inputGroup}>
                  <Text style={themedStyles.inputLabel}>
                    Confirm New Password
                  </Text>
                  <View style={themedStyles.inputContainer}>
                    <Lock color={colors.textSecondary} size={16} />
                    <TextInput
                      style={themedStyles.input}
                      value={passwordData.confirmPassword}
                      onChangeText={(text) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: text,
                        }))
                      }
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!showPasswords.confirm}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff color={colors.textSecondary} size={16} />
                      ) : (
                        <Eye color={colors.textSecondary} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <Button
                  onPress={handlePasswordChange}
                  loading={loading}
                  style={themedStyles.passwordButton}
                >
                  <Text style={themedStyles.buttonText}>Update Password</Text>
                </Button>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card style={themedStyles.dangerCard}>
          <CardHeader>
            <CardTitle style={themedStyles.dangerTitle}>
              <Shield color={colors.red} size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <TouchableOpacity
              style={themedStyles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={themedStyles.deleteText}>Delete Account</Text>
              <Text style={themedStyles.deleteSubtext}>
                Permanently delete your account and all data
              </Text>
            </TouchableOpacity>
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
    editButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      gap: 16,
    },
    avatarContainer: {
      position: "relative",
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    cameraButton: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    verifiedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      gap: 4,
    },
    verifiedText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
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
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.textPrimary,
    },
    disabledInput: {
      color: colors.textSecondary,
    },
    saveSection: {
      paddingHorizontal: 20,
      marginTop: 16,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    securityItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    securityText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    passwordSection: {
      paddingTop: 16,
      gap: 16,
    },
    passwordButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 8,
    },
    dangerCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.red + "10",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.red + "30",
    },
    dangerTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      color: colors.red,
    },
    deleteButton: {
      paddingVertical: 16,
    },
    deleteText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.red,
      marginBottom: 4,
    },
    deleteSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    bottomSpacing: {
      height: 32,
    },
  });

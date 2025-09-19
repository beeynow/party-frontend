"use client";

import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { registerUser, verifyReferralCode } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/theme-context"; // Import useTheme
import type { ThemeContextType } from "@/components/theme-context"; // Declare ThemeContextType
import { Gift, CheckCircle, XCircle } from "lucide-react-native";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState<{
    valid: boolean | null;
    message: string;
    referrerName?: string;
  }>({ valid: null, message: "" });
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const { toast } = useToast();
  const { colors } = useTheme(); // Get theme colors
  useEffect(() => {
    if (ref) {
      setReferralCode(ref);
      checkReferralCode(ref);
    }
  }, [ref]);

  const checkReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralStatus({ valid: null, message: "" });
      return;
    }
    setCheckingReferral(true);
    try {
      const result = await verifyReferralCode(code.trim().toUpperCase());
      setReferralStatus({
        valid: result.valid,
        message: result.message,
        referrerName: result.referrer?.name,
      });
    } catch (error) {
      setReferralStatus({
        valid: false,
        message: "Error verifying referral code",
      });
    } finally {
      setCheckingReferral(false);
    }
  };

  const handleReferralCodeChange = (code: string) => {
    setReferralCode(code);
    if (code.length >= 3) {
      checkReferralCode(code);
    } else {
      setReferralStatus({ valid: null, message: "" });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const registrationData = {
        name,
        email,
        password,
        ...(referralCode.trim() &&
          referralStatus.valid && {
            referralCode: referralCode.trim().toUpperCase(),
          }),
      };

      const result = await registerUser(registrationData);

      if (result.success || result.message) {
        let successMessage = result.message || "Registration successful!";
        if (result.referredBy) {
          successMessage += ` You were referred by ${result.referredBy}!`;
        }

        console.log("Registration data being sent:", registrationData);
        console.log("Registration response:", result);

        toast({
          title: "Registration Successful",
          description: successMessage,
          variant: "success",
        });
        router.push(`/verify-otp?email=${email}`);
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <View style={themedStyles.container}>
      <Card style={themedStyles.card}>
        <CardHeader style={themedStyles.cardHeader}>
          <CardTitle style={themedStyles.title}>
            Register for AdsMoney
          </CardTitle>
          <CardDescription style={themedStyles.description}>
            Enter your details to create an account
          </CardDescription>
        </CardHeader>
        <CardContent style={themedStyles.form}>
          <Input
            label="Name"
            placeholder="John Doe"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Input
            label="Email"
            placeholder="m@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Input
            label="Password"
            placeholder="********"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <View style={themedStyles.referralSection}>
            {checkingReferral ? (
              <View style={themedStyles.loadingIcon} />
            ) : referralStatus.valid === true ? (
              <CheckCircle color={colors.primary} size={20} />
            ) : referralStatus.valid === false ? (
              <XCircle color={colors.red} size={20} />
            ) : referralCode.length > 0 ? (
              <Gift color={colors.textSecondary} size={20} />
            ) : null}
            <Input
              label="Referral Code (Optional)"
              placeholder="Enter referral code"
              autoCapitalize="characters"
              value={referralCode}
              onChangeText={handleReferralCodeChange}
              editable={!loading}
            />
            {referralStatus.message && (
              <View style={themedStyles.referralMessage}>
                <Text
                  style={[
                    themedStyles.referralMessageText,
                    {
                      color: referralStatus.valid ? colors.primary : colors.red,
                    },
                  ]}
                >
                  {referralStatus.valid && referralStatus.referrerName
                    ? `Valid! Referred by ${referralStatus.referrerName}`
                    : referralStatus.message}
                </Text>
              </View>
            )}
            {referralStatus.valid && (
              <View style={themedStyles.referralBonus}>
                <Gift color={colors.primary} size={16} />
                <Text style={themedStyles.referralBonusText}>
                  Your referrer will earn 10 coins when you verify your account!
                </Text>
              </View>
            )}
          </View>

          <Button
            onPress={handleSubmit}
            loading={loading}
            style={themedStyles.button}
          >
            Register
          </Button>
        </CardContent>
        <CardFooter style={themedStyles.footer}>
          <Text style={themedStyles.footerText}>
            Already have an account?{" "}
            <Link href="/login" style={themedStyles.link}>
              Login
            </Link>
          </Text>
        </CardFooter>
      </Card>
    </View>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 16,
    },
    card: {
      width: "100%",
      maxWidth: 400,
    },
    cardHeader: {
      paddingBottom: 0,
    },
    title: {
      textAlign: "center",
    },
    description: {
      textAlign: "center",
    },
    form: {
      gap: 16,
      paddingTop: 0,
    },
    button: {
      marginTop: 8,
    },
    footer: {
      alignItems: "center",
      paddingTop: 0,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    link: {
      color: colors.primary,
      fontWeight: "600",
    },
    referralSection: {
      gap: 8,
    },
    referralMessage: {
      paddingHorizontal: 4,
    },
    referralMessageText: {
      fontSize: 12,
      fontWeight: "500",
    },
    referralBonus: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 4,
      paddingVertical: 8,
      backgroundColor: colors.primary + "10",
      borderRadius: 6,
    },
    referralBonusText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "500",
      flex: 1,
    },
    loadingIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      borderTopColor: "transparent",
    },
  });

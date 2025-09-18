"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Link, useRouter, useLocalSearchParams } from "expo-router"
import { verifyOtp, resendOtp } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/theme-context" // Import useTheme
import type { ThemeContextType } from "@/components/theme-context" // Declare ThemeContextType

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const { toast } = useToast()
  const { colors } = useTheme() // Get theme colors

  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not provided. Please register first.",
        variant: "destructive",
      })
      router.replace("/register")
    }
  }, [email, router, toast])

  const handleVerify = async () => {
    if (!email) return

    setLoading(true)
    try {
      const result = await verifyOtp({ email, otp })
      if (result.message) {
        toast({
          title: "Verification Successful",
          description: result.message,
          variant: "success",
        })
        router.replace("/login")
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    setResendLoading(true)
    try {
      const result = await resendOtp({ email })
      if (result.message) {
        toast({
          title: "OTP Resent",
          description: result.message,
          variant: "success",
        })
      } else {
        toast({
          title: "Resend Failed",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) {
    return null
  }

  const themedStyles = getThemedStyles(colors)

  return (
    <View style={themedStyles.container}>
      <Card style={themedStyles.card}>
        <CardHeader style={themedStyles.cardHeader}>
          <CardTitle style={themedStyles.title}>Verify Your Email</CardTitle>
          <CardDescription style={themedStyles.description}>
            Enter the 6-digit code sent to <Text style={themedStyles.emailText}>{email}</Text>
          </CardDescription>
        </CardHeader>
        <CardContent style={themedStyles.form}>
          <Input
            label="Verification Code"
            placeholder="######"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
            inputStyle={themedStyles.otpInput}
          />

          <Button onPress={handleVerify} loading={loading} style={themedStyles.button}>
            Verify Account
          </Button>
        </CardContent>
        <CardFooter style={themedStyles.footer}>
          <Button onPress={handleResend} loading={resendLoading} variant="link" style={themedStyles.resendButton}>
            Resend Code
          </Button>
          <Text style={themedStyles.footerText}>
            Remembered your password?{" "}
            <Link href="/login" style={themedStyles.link}>
              Login
            </Link>
          </Text>
        </CardFooter>
      </Card>
    </View>
  )
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
    emailText: {
      fontWeight: "bold",
      color: colors.primary,
    },
    form: {
      gap: 16,
      paddingTop: 0,
    },
    otpInput: {
      textAlign: "center",
      letterSpacing: 4,
    },
    button: {
      marginTop: 8,
    },
    footer: {
      alignItems: "center",
      paddingTop: 0,
      gap: 10,
    },
    resendButton: {
      paddingVertical: 0,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    link: {
      color: colors.primary,
      fontWeight: "600",
    },
  })

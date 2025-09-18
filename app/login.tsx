"use client"

import { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Link, useRouter } from "expo-router"
import { loginUser } from "@/lib/api"
import { saveAuthToken } from "@/lib/auth-storage"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/theme-context"
import type { ThemeContextType } from "@/components/theme-context"
import { Alert } from "react-native"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { colors } = useTheme()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await loginUser({ email, password })
      console.log("Backend login response:", result) // Log the full response for debugging

      if (result.message === "Login successful" && result.token) {
        toast({
          title: "Login Successful",
          description: "Welcome back to AdsMoney!",
          variant: "success",
        })
        await saveAuthToken(result.token)
        console.log('token saved');
        router.replace("/(tabs)/overview")
      } else {
        // Differentiate between general failure and missing token
        let errorMessage = result.message || "An unknown error occurred."
        if (result.message === "Login successful" && !result.token) {
          errorMessage = "Login successful, but no authentication token received. Please check backend configuration."
        }
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const themedStyles = getThemedStyles(colors)

  return (
    <View style={themedStyles.container}>
      <Card style={themedStyles.card}>
        <CardHeader style={themedStyles.cardHeader}>
          <CardTitle style={themedStyles.title}>Login to AdsMoney</CardTitle>
          <CardDescription style={themedStyles.description}>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent style={themedStyles.form}>
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

          <Button onPress={handleSubmit} loading={loading} style={themedStyles.button}>
            Login
          </Button>
        </CardContent>
        <CardFooter style={themedStyles.footer}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
  <Text style={themedStyles.footerText}>Don't have an account? </Text>
  <Link href="/register" asChild>
    <Text style={themedStyles.link}>Register</Text>
  </Link>
</View>

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
  })

"use client"

import { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Link, useRouter } from "expo-router"
import { registerUser } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/theme-context" // Import useTheme
import type { ThemeContextType } from "@/components/theme-context" // Declare ThemeContextType

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { colors } = useTheme() // Get theme colors

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await registerUser({ name, email, password })
      if (result.message) {
        toast({
          title: "Registration Successful",
          description: result.message,
          variant: "success",
        })
        router.push(`/verify-otp?email=${email}`)
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
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
          <CardTitle style={themedStyles.title}>Register for AdsMoney</CardTitle>
          <CardDescription style={themedStyles.description}>Enter your details to create an account</CardDescription>
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

          <Button onPress={handleSubmit} loading={loading} style={themedStyles.button}>
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

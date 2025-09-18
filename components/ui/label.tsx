"use client"

import type React from "react"
import { Text, StyleSheet, type TextStyle } from "react-native"
import { useTheme } from "@/components/theme-context"
import type { ThemeContextType } from "../theme-context"

interface LabelProps {
  children: React.ReactNode
  style?: TextStyle | TextStyle[] // ✅ FIXED here
}

export function Label({ children, style }: LabelProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <Text style={[themedStyles.label, style]}>{children}</Text>
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textPrimary,
    },
  })

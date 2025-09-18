"use client"

import type React from "react"
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { useTheme } from "@/components/theme-context" // Import useTheme
import type { ThemeContextType } from "@/components/theme-context" // Declare ThemeContextType

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
}

interface CardHeaderProps {
  children: React.ReactNode
  style?: ViewStyle
}

interface CardTitleProps {
  children: React.ReactNode
  style?: TextStyle
}

interface CardDescriptionProps {
  children: React.ReactNode
  style?: TextStyle
}

interface CardContentProps {
  children: React.ReactNode
  style?: ViewStyle
}

interface CardFooterProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <View style={[themedStyles.card, style]}>{children}</View>
}

export function CardHeader({ children, style }: CardHeaderProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <View style={[themedStyles.cardHeader, style]}>{children}</View>
}

export function CardTitle({ children, style }: CardTitleProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <Text style={[themedStyles.cardTitle, style]}>{children}</Text>
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <Text style={[themedStyles.cardDescription, style]}>{children}</Text>
}

export function CardContent({ children, style }: CardContentProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <View style={[themedStyles.cardContent, style]}>{children}</View>
}

export function CardFooter({ children, style }: CardFooterProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)
  return <View style={[themedStyles.cardFooter, style]}>{children}</View>
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      padding: 24,
      paddingBottom: 16,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    cardContent: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    cardFooter: {
      padding: 24,
      paddingTop: 16,
    },
  })

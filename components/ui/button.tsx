"use client"

import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { useTheme } from "@/components/theme-context"
import type { ThemeContextType } from "@/components/theme-context"

interface ButtonProps {
  children: React.ReactNode // Can be text, icon, or any React node
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "default" | "outline" | "link"
  style?: ViewStyle
  textStyle?: TextStyle // This style will now only apply if children is Text
}

export function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
  variant = "default",
  style,
  textStyle, // textStyle is now less directly used by the Button itself
}: ButtonProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)

  const buttonStyles = [themedStyles.button, themedStyles[variant], style]

  // If children is a string or number, we'll wrap it in a Text component with appropriate styles.
  // Otherwise, we'll render it directly (e.g., for icons).
  const renderChildren = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      const buttonTextStyles = [themedStyles.buttonText, themedStyles[`${variant}Text`], textStyle]
      return <Text style={buttonTextStyles}>{children}</Text>
    }
    return children
  }

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={loading || disabled}>
      {loading ? (
        <ActivityIndicator color={variant === "default" ? colors.white : colors.primary} />
      ) : (
        renderChildren() // Render children dynamically
      )}
    </TouchableOpacity>
  )
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row", // Added to properly align icons and text if both are present
    },
    default: {
      backgroundColor: colors.primary,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    link: {
      backgroundColor: "transparent",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    defaultText: {
      color: colors.white,
    },
    outlineText: {
      color: colors.textPrimary,
    },
    linkText: {
      color: colors.primary,
    },
  })

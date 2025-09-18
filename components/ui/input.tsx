"use client"

import { View, TextInput, StyleSheet, type TextInputProps, type TextStyle, type ViewStyle } from "react-native"
import { Label } from "./label"
import { useTheme } from "@/components/theme-context" // Import useTheme
import type { ThemeContextType } from "@/components/theme-context" // Declare ThemeContextType

interface InputProps extends TextInputProps {
  label?: string
  labelStyle?: TextStyle
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

export function Input({ label, labelStyle, containerStyle, inputStyle, ...rest }: InputProps) {
  const { colors } = useTheme()
  const themedStyles = getThemedStyles(colors)

  return (
    <View style={[themedStyles.inputContainer, containerStyle]}>
      {label && <Label style={[themedStyles.label, ...(labelStyle ? [labelStyle] : [])]}>{label}</Label>}
      <TextInput
        style={[themedStyles.input, inputStyle]}
        placeholderTextColor={colors.textSecondary} // Set placeholder color based on theme
        {...rest}
      />
    </View>
  )
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      color: colors.textPrimary,
    },
  })

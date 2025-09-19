"use client";

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";

interface ButtonProps {
  children: React.ReactNode; // Can be text, icon, or any React node
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "link";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
  variant = "default",
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const themedStyles = getThemedStyles(colors);

  const buttonStyles = [themedStyles.button, themedStyles[variant], style];

  // Recursively wrap strings/numbers in <Text>
  const renderChildren = (child: React.ReactNode): React.ReactNode => {
    if (typeof child === "string" || typeof child === "number") {
      const buttonTextStyles = [
        themedStyles.buttonText,
        themedStyles[`${variant}Text`],
        textStyle,
      ];
      return <Text style={buttonTextStyles}>{child}</Text>;
    } else if (Array.isArray(child)) {
      return child.map((c, i) => (
        <React.Fragment key={i}>{renderChildren(c)}</React.Fragment>
      ));
    }
    return child; // Already a React element (like an icon)
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "default" ? colors.white : colors.primary}
        />
      ) : (
        renderChildren(children)
      )}
    </TouchableOpacity>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    button: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row", // To align icons + text
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
  });

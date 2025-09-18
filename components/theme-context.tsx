"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { Appearance, useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Theme = "light" | "dark" | "system"

// Corrected: Added 'export' keyword here
export interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  colors: {
    background: string
    cardBackground: string
    textPrimary: string
    textSecondary: string
    red: string
    primary: string
    white: string
    border: string
    cardShadow: string
    headerBorder: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "app-theme"

const lightColors = {
  background: "#f5f5f5",
  cardBackground: "#fff",
  textPrimary: "#1f2937",
  red: "#fd0404ff",
  textSecondary: "#6b7280",
  primary: "#4f46e5",
  white: "#fff",
  border: "#d1d5db",
  cardShadow: "#000",
  headerBorder: "#e5e7eb",
}

const darkColors = {
  background: "#1a1a1a",
  cardBackground: "#2a2a2a",
  textPrimary: "#e0e0e0",
  red: "#fd0404ff",
  textSecondary: "#a0a0a0",
  primary: "#8b5cf6",
  white: "#fff",
  border: "#4a4a4a",
  cardShadow: "#000",
  headerBorder: "#3a3a3a",
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() // 'light' or 'dark'
  const [theme, setThemeState] = useState<Theme>("system") // User's preferred theme
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(systemColorScheme || "light")

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as Theme | null
        if (storedTheme) {
          setThemeState(storedTheme)
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error)
      }
    }
    loadTheme()
  }, [])

  useEffect(() => {
    const newResolvedTheme = theme === "system" ? systemColorScheme || "light" : theme
    setResolvedTheme(newResolvedTheme)
    Appearance.setColorScheme(newResolvedTheme) // Set system color scheme for native UI elements
  }, [theme, systemColorScheme])

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.error("Failed to save theme to storage", error)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }, [resolvedTheme, setTheme])

  const colors = resolvedTheme === "light" ? lightColors : darkColors

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    colors,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

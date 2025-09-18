import { Stack, useRouter, SplashScreen } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/components/theme-context";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth-storage";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import type { ThemeContextType } from "@/components/theme-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// This component will handle the initial app content and loading state
function AppContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const token = await getAuthToken();
        if (token) {
          router.replace("/(tabs)/overview"); // Imperatively navigate if token exists
        } else {
          router.replace("/login"); // Imperatively navigate to login if no token
        }
      } catch (e) {
        console.warn("Error during app preparation:", e);
        router.replace("/login"); // Fallback to login on error
      } finally {
        setIsAppReady(true);
        SplashScreen.hideAsync(); // Hide splash screen once navigation is initiated
      }
    }

    prepare();
  }, []); // Run once on component mount

  if (!isAppReady) {
    // Render a simple loading screen while the app is preparing and navigating
    return (
      <View style={getThemedStyles(colors).loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once navigation is initiated, this component will effectively unmount
  // or be replaced by the target screen. We return null here as the navigation
  // is handled imperatively.
  return null;
}

// The RootLayout now primarily sets up the ThemeProvider and SafeAreaProvider
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* The Stack component defines the navigation structure */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* The index screen will be the first one loaded, which then triggers AppContent */}
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* AppContent is rendered on top of the Stack to handle initial loading and redirects */}
        <AppContent />
        <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Styles for the loading container, using theme colors
const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background, // Use theme background color
    },
  });

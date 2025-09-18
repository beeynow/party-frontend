"use client";

import { View, Text, StyleSheet, SafeAreaView, Animated } from "react-native"; // Animated from react-native
import { useRef, useEffect } from "react"; // useRef and useEffect from react
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme, type ThemeContextType } from "@/components/theme-context";

export default function EarningsTab() {
  const { colors } = useTheme();
  const themedStyles = getThemedStyles(colors);

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim1 = useRef(new Animated.Value(0)).current;
  const cardAnim2 = useRef(new Animated.Value(0)).current;
  const cardAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim1, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim2, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim3, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, cardAnim1, cardAnim2, cardAnim3]);

  const headerAnimatedStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  const cardAnimatedStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <Animated.View style={[themedStyles.header, headerAnimatedStyle]}>
        <Text style={themedStyles.headerTitle}>Your Earnings</Text>
      </Animated.View>
      <View style={themedStyles.contentContainer}>
        <Animated.View
          style={[
            themedStyles.card,
            themedStyles.summaryCard,
            cardAnimatedStyle(cardAnim1),
          ]}
        >
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.summaryValue}>$45.78</Text>
            <Text style={themedStyles.summaryDescription}>
              Todays estimated earnings
            </Text>
          </CardContent>
        </Animated.View>

        <Animated.View
          style={[
            themedStyles.card,
            themedStyles.chartCard,
            cardAnimatedStyle(cardAnim2),
          ]}
        >
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={themedStyles.cardContentText}>
              (Placeholder for a beautiful earnings chart)
            </Text>
            <Text style={themedStyles.cardDescriptionText}>
              Visualize your revenue growth over time.
            </Text>
          </CardContent>
        </Animated.View>

        <Animated.View
          style={[themedStyles.card, cardAnimatedStyle(cardAnim3)]}
        >
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={themedStyles.transactionItem}>
              <Text style={themedStyles.transactionText}>Ad Campaign A</Text>
              <Text style={themedStyles.transactionAmount}>+$12.50</Text>
            </View>
            <View style={themedStyles.transactionItem}>
              <Text style={themedStyles.transactionText}>Ad Campaign B</Text>
              <Text style={themedStyles.transactionAmount}>+$8.25</Text>
            </View>
            <View style={themedStyles.transactionItem}>
              <Text style={themedStyles.transactionText}>Referral Bonus</Text>
              <Text style={themedStyles.transactionAmount}>+$5.00</Text>
            </View>
            <Text style={themedStyles.cardDescriptionText}>
              View all your recent earnings activities.
            </Text>
          </CardContent>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 16,
      gap: 16,
    },
    card: {
      width: "100%",
    },
    summaryCard: {
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    summaryValue: {
      fontSize: 36,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    summaryDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    chartCard: {
      minHeight: 180,
      justifyContent: "center",
      alignItems: "center",
    },
    cardContentText: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: "center",
    },
    cardDescriptionText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    transactionItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
  });

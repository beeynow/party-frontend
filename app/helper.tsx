"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  HelpCircle,
  ChevronLeft,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Book,
  Video,
  ChevronRight,
  ChevronDown,
  Send,
  ExternalLink,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    email: "",
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const { colors } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I earn coins through referrals?",
      answer:
        "Share your unique referral code with friends. When they sign up and verify their account, you'll automatically earn 10 coins. There's no limit to how many friends you can refer!",
      expanded: false,
    },
    {
      id: "2",
      question: "When will I receive my referral rewards?",
      answer:
        "Referral rewards are credited to your account immediately after your referred friend completes their account verification. You'll receive a notification when the coins are added.",
      expanded: false,
    },
    {
      id: "3",
      question: "How can I check my referral history?",
      answer:
        "Go to the Referrals tab to see all your successful referrals, including the names of friends you've referred and the coins earned from each referral.",
      expanded: false,
    },
    {
      id: "4",
      question: "What can I do with my coins?",
      answer:
        "Coins can be redeemed for various rewards including gift cards, cash payouts, and exclusive offers. Check the rewards section for current redemption options.",
      expanded: false,
    },
    {
      id: "5",
      question: "Is my personal information secure?",
      answer:
        "Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent.",
      expanded: false,
    },
    {
      id: "6",
      question: "How do I update my profile information?",
      answer:
        "Go to Profile > Account Settings to update your name, phone number, and other personal information. Note that your email address cannot be changed for security reasons.",
      expanded: false,
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = () => {
    if (!contactForm.subject || !contactForm.message || !contactForm.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending contact form
    toast({
      title: "Message Sent! 📧",
      description: "We'll get back to you within 24 hours",
      variant: "success",
    });

    setContactForm({ subject: "", message: "", email: "" });
    setShowContactForm(false);
  };

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast({
          title: "Error",
          description: "Unable to open link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to open link",
        variant: "destructive",
      });
    }
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Help & Support</Text>
        <View style={themedStyles.headerRight} />
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        contentContainerStyle={{ paddingBottom: 10, paddingTop: 12 }} // 👈 add padding
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <HelpCircle color={colors.primary} size={20} />
              Get Help Quickly
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <View style={themedStyles.quickActions}>
              <TouchableOpacity
                style={themedStyles.actionButton}
                onPress={() => setShowContactForm(!showContactForm)}
              >
                <View style={themedStyles.actionIcon}>
                  <MessageCircle color={colors.primary} size={20} />
                </View>
                <Text style={themedStyles.actionText}>Contact Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themedStyles.actionButton}
                onPress={() =>
                  openExternalLink("mailto:support@Party-Support.com")
                }
              >
                <View style={themedStyles.actionIcon}>
                  <Mail color="#10B981" size={20} />
                </View>
                <Text style={themedStyles.actionText}>Email Support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themedStyles.actionButton}
                onPress={() => openExternalLink("tel:+1-800-123-4567")}
              >
                <View style={themedStyles.actionIcon}>
                  <Phone color="#F59E0B" size={20} />
                </View>
                <Text style={themedStyles.actionText}>Call Support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themedStyles.actionButton}
                onPress={() =>
                  openExternalLink("https://Party-Support.com/help")
                }
              >
                <View style={themedStyles.actionIcon}>
                  <Globe color="#8B5CF6" size={20} />
                </View>
                <Text style={themedStyles.actionText}>Help Center</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Contact Form */}
        {showContactForm && (
          <Card style={themedStyles.card}>
            <CardHeader>
              <CardTitle style={themedStyles.cardTitle}>
                <Send color={colors.primary} size={20} />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent style={themedStyles.cardContent}>
              <View style={themedStyles.formGroup}>
                <Text style={themedStyles.formLabel}>Email Address</Text>
                <TextInput
                  style={themedStyles.formInput}
                  value={contactForm.email}
                  onChangeText={(text) =>
                    setContactForm((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>

              <View style={themedStyles.formGroup}>
                <Text style={themedStyles.formLabel}>Subject</Text>
                <TextInput
                  style={themedStyles.formInput}
                  value={contactForm.subject}
                  onChangeText={(text) =>
                    setContactForm((prev) => ({ ...prev, subject: text }))
                  }
                  placeholder="What can we help you with?"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={themedStyles.formGroup}>
                <Text style={themedStyles.formLabel}>Message</Text>
                <TextInput
                  style={[themedStyles.formInput, themedStyles.messageInput]}
                  value={contactForm.message}
                  onChangeText={(text) =>
                    setContactForm((prev) => ({ ...prev, message: text }))
                  }
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={themedStyles.formActions}>
                <Button
                  onPress={handleContactSubmit}
                  style={themedStyles.submitButton}
                >
                  <View style={themedStyles.submitContent}>
                    <Send color="white" size={16} />
                    <Text style={themedStyles.submitText}>Send Message</Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {/* FAQs */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Book color={colors.primary} size={20} />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            {faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={themedStyles.faqItem}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={themedStyles.faqHeader}>
                  <Text style={themedStyles.faqQuestion}>{faq.question}</Text>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown color={colors.primary} size={20} />
                  ) : (
                    <ChevronRight color={colors.textSecondary} size={20} />
                  )}
                </View>
                {expandedFAQ === faq.id && (
                  <View style={themedStyles.faqAnswer}>
                    <Text style={themedStyles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card style={themedStyles.card}>
          <CardHeader>
            <CardTitle style={themedStyles.cardTitle}>
              <Video color={colors.primary} size={20} />
              Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent style={themedStyles.cardContent}>
            <TouchableOpacity
              style={themedStyles.resourceItem}
              onPress={() =>
                openExternalLink("https://youtube.com/@Party-Support")
              }
            >
              <View style={themedStyles.resourceLeft}>
                <View style={themedStyles.resourceIcon}>
                  <Video color="#EF4444" size={18} />
                </View>
                <View style={themedStyles.resourceText}>
                  <Text style={themedStyles.resourceTitle}>
                    Video Tutorials
                  </Text>
                </View>
              </View>
              <ExternalLink color={colors.textSecondary} size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.resourceItem}
              onPress={() =>
                openExternalLink("https://Party-Support.com/guide")
              }
            >
              <View style={themedStyles.resourceLeft}>
                <View style={themedStyles.resourceIcon}>
                  <Book color="#10B981" size={18} />
                </View>
                <View style={themedStyles.resourceText}>
                  <Text style={themedStyles.resourceTitle}>User Guide</Text>
                  <Text style={themedStyles.resourceDescription}>
                    Complete guide to using Party-Support
                  </Text>
                </View>
              </View>
              <ExternalLink color={colors.textSecondary} size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.resourceItem}
              onPress={() => openExternalLink("https://Party-Support.com/blog")}
            >
              <View style={themedStyles.resourceLeft}>
                <View style={themedStyles.resourceIcon}>
                  <Globe color="#8B5CF6" size={18} />
                </View>
                <View style={themedStyles.resourceText}>
                  <Text style={themedStyles.resourceTitle}>Blog & Tips</Text>
                  <Text style={themedStyles.resourceDescription}>
                    Latest updates
                  </Text>
                </View>
              </View>
              <ExternalLink color={colors.textSecondary} size={16} />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card style={themedStyles.infoCard}>
          <CardContent style={themedStyles.infoContent}>
            <Text style={themedStyles.infoTitle}>Need More Help?</Text>
            <Text style={themedStyles.infoDescription}>
              Our support team is available Monday to Friday, 9 AM to 6 PM EST.
            </Text>

            <View style={themedStyles.contactInfo}>
              <View style={themedStyles.contactItem}>
                <Mail color={colors.primary} size={16} />
                <Text style={themedStyles.contactText}>
                  support@Party-Support.com
                </Text>
              </View>
              <View style={themedStyles.contactItem}>
                <Phone color={colors.primary} size={16} />
                <Text style={themedStyles.contactText}>+1 (800) 123-4567</Text>
              </View>
              <View style={themedStyles.contactItem}>
                <Globe color={colors.primary} size={16} />
                <Text style={themedStyles.contactText}>
                  Party-Support.com/support
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={themedStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      //   flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
      flex: 1,
      textAlign: "center",
    },
    headerRight: {
      width: 40,
    },
    card: {
      marginHorizontal: 20,
      marginVertical: 100,
      marginTop: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
    },
    cardTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardContent: {
      padding: 20,
      paddingTop: 0,
    },
    quickActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      flex: 1,
      minWidth: "40%",
      gap: 8,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    actionText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    formInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    messageInput: {
      height: 100,
      textAlignVertical: "top",
    },
    formActions: {
      marginTop: 8,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
    },
    submitContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    submitText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    faqItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 16,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 12,
    },
    faqAnswer: {
      marginTop: 12,
      paddingLeft: 8,
    },
    faqAnswerText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    resourceItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resourceLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    resourceIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    resourceText: {
      flex: 1,
    },
    resourceTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    resourceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.primary + "10",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    infoContent: {
      padding: 20,
      alignItems: "center",
      gap: 12,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.textPrimary,
      textAlign: "center",
    },
    infoDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    contactInfo: {
      marginTop: 8,
      gap: 8,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    contactText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    bottomSpacing: {
      height: 32,
    },
  });

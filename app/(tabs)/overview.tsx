"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { getDashboardData, getTotalUserCount, getPosts } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
  Send,
  Plus,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface DemoPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  imageUrl: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  coins: number;
  referralCount: number;
}

// Demo posts with online image URIs
const demoPosts: DemoPost[] = [
  {
    id: "1",
    author: {
      name: "Alex Johnson",
      username: "@alexj",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    content:
      "Beautiful sunset from my evening walk! Nature never fails to amaze me. 🌅",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    timestamp: "2h ago",
    likes: 42,
    comments: 8,
    reposts: 3,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      username: "@sarahc",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    content:
      "Just finished this amazing book! Highly recommend it to anyone interested in tech and innovation.",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    timestamp: "4h ago",
    likes: 28,
    comments: 12,
    reposts: 5,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "3",
    author: {
      name: "Mike Rodriguez",
      username: "@mikerod",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    content:
      "Coffee and code - the perfect combination for a productive morning! ☕️💻",
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    timestamp: "6h ago",
    likes: 67,
    comments: 15,
    reposts: 8,
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "4",
    author: {
      name: "Emma Wilson",
      username: "@emmaw",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    content:
      "Exploring the city on my bike today. Found this amazing street art! 🚲🎨",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    timestamp: "8h ago",
    likes: 35,
    comments: 6,
    reposts: 2,
    isLiked: false,
    isBookmarked: false,
  },
];

export default function OverviewScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<DemoPost[]>(demoPosts);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const dashboardResult = await getDashboardData();

      if (dashboardResult.success && dashboardResult.user) {
        setUserData(dashboardResult.user);
      } else {
        toast({
          title: "Error",
          description:
            dashboardResult.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Comment",
      description: "Comment feature coming soon!",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Share",
      description: "Share feature coming soon!",
    });
  };

  const handleMore = (postId: string) => {
    toast({
      title: "More Options",
      description: "More options coming soon!",
    });
  };

  const themedStyles = getThemedStyles(colors);

  if (loading && !userData) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Text style={themedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <View>
          <Text style={themedStyles.welcomeText}>Welcome back,</Text>
          <Text style={themedStyles.nameText}>{userData?.name}!</Text>
        </View>
        <TouchableOpacity style={themedStyles.createPostButton}>
          <Plus color={colors.white} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Posts Feed */}
        <View style={themedStyles.feed}>
          {posts.map((post) => (
            <Card key={post.id} style={themedStyles.postCard}>
              <CardContent style={themedStyles.postContent}>
                {/* Post Header */}
                <View style={themedStyles.postHeader}>
                  <View style={themedStyles.authorInfo}>
                    <Image
                      source={{ uri: post.author.avatar }}
                      style={themedStyles.avatar}
                    />
                    <View style={themedStyles.authorText}>
                      <Text style={themedStyles.authorName}>
                        {post.author.name}
                      </Text>
                      <View style={themedStyles.timestampContainer}>
                        <Text style={themedStyles.username}>
                          {post.author.username}
                        </Text>
                        <Text style={themedStyles.timestamp}>
                          • {post.timestamp}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleMore(post.id)}
                    style={themedStyles.moreButton}
                  >
                    <MoreHorizontal color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>

                {/* Post Content */}
                <Text style={themedStyles.postText}>{post.content}</Text>

                {/* Post Image */}
                <Image
                  source={{ uri: post.imageUrl }}
                  style={themedStyles.postImage}
                  resizeMode="cover"
                />

                {/* Engagement Stats */}
                <View style={themedStyles.engagementStats}>
                  <Text style={themedStyles.statText}>
                    {post.likes} likes • {post.comments} comments •{" "}
                    {post.reposts} reposts
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={themedStyles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => handleLike(post.id)}
                    style={themedStyles.actionButton}
                  >
                    <Heart
                      color={post.isLiked ? colors.red : colors.textSecondary}
                      size={22}
                      fill={post.isLiked ? colors.red : "transparent"}
                    />
                    <Text
                      style={[
                        themedStyles.actionText,
                        post.isLiked && { color: colors.red },
                      ]}
                    >
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleComment(post.id)}
                    style={themedStyles.actionButton}
                  >
                    <MessageCircle color={colors.textSecondary} size={22} />
                    <Text style={themedStyles.actionText}>{post.comments}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleShare(post.id)}
                    style={themedStyles.actionButton}
                  >
                    <Share color={colors.textSecondary} size={22} />
                    <Text style={themedStyles.actionText}>{post.reposts}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleBookmark(post.id)}
                    style={themedStyles.bookmarkButton}
                  >
                    <Bookmark
                      color={
                        post.isBookmarked
                          ? colors.primary
                          : colors.textSecondary
                      }
                      size={22}
                      fill={post.isBookmarked ? colors.primary : "transparent"}
                    />
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingBottom: 10,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    nameText: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginTop: 4,
    },
    createPostButton: {
      backgroundColor: colors.primary,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    quickStats: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginBottom: 10,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    feed: {
      paddingHorizontal: 16,
    },
    postCard: {
      marginBottom: 16,
      backgroundColor: colors.cardBackground,
    },
    postContent: {
      padding: 16,
    },
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    authorInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    authorText: {
      flex: 1,
    },
    authorName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    timestampContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    username: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    timestamp: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    moreButton: {
      padding: 8,
    },
    postText: {
      fontSize: 16,
      color: colors.textPrimary,
      lineHeight: 22,
      marginBottom: 12,
    },
    postImage: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    engagementStats: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 12,
    },
    statText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      flex: 1,
    },
    bookmarkButton: {
      padding: 8,
      marginLeft: 12,
    },
    actionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 6,
      fontWeight: "500",
    },
  });

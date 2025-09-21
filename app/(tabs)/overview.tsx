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
  Alert,
} from "react-native";
import { getDashboardData, getPosts, likePost, commentOnPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
  Plus,
  Eye,
  CircleCheckBig,
  ShieldCheck,
  ExternalLink,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearPostsCache,
  getPostsCache,
  savePostsCache,
} from "@/lib/auth-storage";

const { width: screenWidth } = Dimensions.get("window");

interface Post {
  _id: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    referralCode?: string;
  };
  content: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  views: number;
  isLikedByUser: boolean;
  category?: string;
  tags?: string[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  coins: number;
  referralCount: number;
}

export default function OverviewScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const fetchPosts = async (pageNum = 1, isRefresh = false) => {
    // 🚀 INSTANT: Load from cache first (only for initial load)
    if (pageNum === 1 && !isRefresh && posts.length === 0) {
      try {
        console.log("🔍 Checking cache for instant load...");
        const cachedPosts = await getPostsCache();

        if (cachedPosts?.posts && cachedPosts.posts.length > 0) {
          console.log(
            "⚡ Found cached posts, loading instantly:",
            cachedPosts.posts.length
          );

          // Transform cached data to match expected format
          const transformedPosts = cachedPosts.posts.map((image: any) => ({
            _id: image._id,
            createdBy: {
              _id: image.createdBy?._id || image.createdBy,
              name: image.createdByName || image.createdBy?.name || "Anonymous",
              email: image.createdByEmail || image.createdBy?.email || "",
              referralCode: image.createdBy?.referralCode || "",
            },
            content: image.content || "",
            url: image.url,
            thumbnailUrl: image.thumbnailUrl || image.url,
            createdAt: image.createdAt,
            likeCount: image.likeCount || 0,
            commentCount: image.commentCount || 0,
            views: image.views || 0,
            isLikedByUser: image.isLikedByUser || false,
            category: image.category || "general",
            tags: image.tags || [],
          }));

          setPosts(transformedPosts);
          setLoading(false); // Stop loading spinner immediately
          console.log("✅ Posts loaded from cache instantly");
        } else {
          console.log("📭 No cached posts found, will load from API");
        }
      } catch (error) {
        console.log("❌ Cache load failed:", error);
      }
    }

    if (pageNum > 1) setLoadingMore(true);

    try {
      console.log(`📡 Fetching posts from API - page ${pageNum}`);
      const postsResult = await getPosts(pageNum, 10);

      if (postsResult.success && postsResult.data?.images) {
        const newPosts = postsResult.data.images.map((image: any) => ({
          _id: image._id,
          createdBy: {
            _id: image.createdBy._id || image.createdBy,
            name: image.createdByName || image.createdBy?.name || "Anonymous",
            email: image.createdByEmail || image.createdBy?.email || "",
            referralCode: image.createdBy?.referralCode || "",
          },
          content: image.content || "",
          url: image.url,
          thumbnailUrl: image.thumbnailUrl || image.url,
          createdAt: image.createdAt,
          likeCount: image.likeCount || 0,
          commentCount: image.commentCount || 0,
          views: image.views || 0,
          isLikedByUser: image.isLikedByUser || false,
          category: image.category || "general",
          tags: image.tags || [],
        }));

        if (isRefresh || pageNum === 1) {
          setPosts(newPosts);
          // 🔥 CACHE: Save fresh data for next instant load
          if (pageNum === 1) {
            console.log("💾 Caching fresh posts for next time");
            await savePostsCache(newPosts, pageNum);
          }
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }

        setHasMore(postsResult.data.pagination?.hasMore || false);
        console.log(`✅ API posts loaded - page ${pageNum}`);
      } else {
        if (pageNum === 1) {
          setPosts([]);
        }
        if (pageNum === 1) {
          toast({
            title: "Info",
            description: "No posts found",
          });
        }
      }
    } catch (error: any) {
      console.error("❌ API Error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      if (pageNum > 1) setLoadingMore(false);
      setLoading(false); // Ensure loading is stopped
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log("🚀 Starting app load...");

      // Start both simultaneously - don't wait for one to finish
      const dashboardPromise = fetchDashboardData();
      const postsPromise = fetchPosts(1);

      // Let them run in parallel
      await Promise.allSettled([dashboardPromise, postsPromise]);

      console.log("✅ App load complete");
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    setPage(1);
    // Clear cache to force fresh data
    await clearPostsCache();

    // Parallel refresh
    await Promise.all([fetchDashboardData(true), fetchPosts(1, true)]);
  };

  const loadMore = async () => {
    if (hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchPosts(nextPage);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLikedByUser: !post.isLikedByUser,
              likeCount: post.isLikedByUser
                ? post.likeCount - 1
                : post.likeCount + 1,
            }
          : post
      )
    );

    try {
      const result = await likePost(postId);
      console.log("🔥 Like result:", result);

      if (result.success) {
        // Update with server response
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  isLikedByUser: result.data.isLiked,
                  likeCount: result.data.likeCount,
                }
              : post
          )
        );

        toast({
          title: "Success",
          description: result.data.isLiked ? "Post liked!" : "Post unliked!",
          variant: "success",
        });
      } else {
        throw new Error(result.message || "Failed to update like");
      }
    } catch (error: any) {
      console.error("❌ Like error:", error);

      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLikedByUser: !post.isLikedByUser,
                likeCount: post.isLikedByUser
                  ? post.likeCount + 1
                  : post.likeCount - 1,
              }
            : post
        )
      );

      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleComment = (postId: string) => {
    Alert.prompt(
      "Add Comment",
      "What do you think about this post?",
      async (text) => {
        if (text && text.trim()) {
          try {
            console.log("💬 Adding comment:", { postId, text: text.trim() });
            const result = await commentOnPost(postId, text.trim());
            console.log("💬 Comment result:", result);

            if (result.success) {
              // Update post with new comment count
              setPosts((prevPosts) =>
                prevPosts.map((post) =>
                  post._id === postId
                    ? {
                        ...post,
                        commentCount: result.data.commentCount,
                      }
                    : post
                )
              );

              toast({
                title: "Success",
                description: "Comment added successfully!",
                variant: "success",
              });
            } else {
              throw new Error(result.message || "Failed to add comment");
            }
          } catch (error: any) {
            console.error("❌ Comment error:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to add comment",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Warning",
            description: "Please enter a comment",
            variant: "destructive",
          });
        }
      },
      "plain-text",
      "", // default text
      "Add Comment" // OK button text
    );
  };

  const handleShare = async (postId: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      // Get the post URL - you'll need to adjust this based on your app's structure
      const postUrl = `${
        process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000"
      }/posts/${postId}`;

      // For React Native, you can use the Share API
      const { Share } = require("react-native");

      await Share.share({
        message: `Check out this post: ${
          post.content || "Amazing post!"
        }\n\n${postUrl}`,
        url: postUrl, // iOS only
        title: "Share Post",
      });

      toast({
        title: "Shared",
        description: "Post shared successfully!",
        variant: "success",
      });
    } catch (error: any) {
      console.error("❌ Share error:", error);

      // Fallback: Copy to clipboard
      try {
        const { Clipboard } = require("@react-native-clipboard/clipboard");
        const post = posts.find((p) => p._id === postId);
        const postUrl = `${
          process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000"
        }/posts/${postId}`;

        await Clipboard.setString(
          `Check out this post: ${
            post?.content || "Amazing post!"
          }\n\n${postUrl}`
        );

        toast({
          title: "Copied",
          description: "Post link copied to clipboard!",
          variant: "success",
        });
      } catch (clipboardError) {
        console.error("❌ Clipboard error:", clipboardError);
        toast({
          title: "Info",
          description: "Share feature coming soon!",
        });
      }
    }
  };

  const handleMore = (postId: string) => {
    toast({
      title: "More Options",
      description: "More options coming soon!",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getAvatarUrl = (name: string) => {
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % 100;
    return `https://images.unsplash.com/photo-${
      1500000000000 + avatarIndex
    }?w=100&h=100&fit=crop&crop=face`;
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 100;

          if (isCloseToBottom && hasMore && !loadingMore) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
      >
        {/* Posts Feed */}
        <View style={themedStyles.feed}>
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <Card key={post._id} style={themedStyles.postCard}>
                  <CardContent style={themedStyles.postContent}>
                    {/* Post Header */}
                    <View style={themedStyles.postHeader}>
                      <View style={themedStyles.authorInfo}>
                        <View style={themedStyles.friendAvatar}>
                          <Text style={themedStyles.friendInitial}>
                            {post?.createdBy?.name?.charAt(0).toUpperCase() ||
                              "?"}
                          </Text>
                        </View>
                        <View style={themedStyles.authorText}>
                          <View style={themedStyles.name}>
                            <Text style={themedStyles.authorName}>
                              {post.createdBy.name}
                            </Text>
                            <ShieldCheck color={colors.primary} size={16} />
                          </View>
                          <View style={themedStyles.timestampContainer}>
                            <Text style={themedStyles.username}>
                              @{post.createdBy.referralCode || "user"}
                            </Text>
                            <Text style={themedStyles.timestamp}>
                              • {formatTimeAgo(post.createdAt)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleMore(post._id)}
                        style={themedStyles.moreButton}
                      >
                        <MoreHorizontal
                          color={colors.textSecondary}
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Post Content */}
                    {post.content && (
                      <Text style={themedStyles.postText}>{post.content}</Text>
                    )}

                    {/* Post Image */}
                    <Image
                      source={{ uri: post.url }}
                      style={themedStyles.postImage}
                      resizeMode="cover"
                    />

                    {/* Engagement Stats */}
                    <View style={themedStyles.engagementStats}>
                      <Text style={themedStyles.statText}>
                        {post.likeCount} likes • {post.commentCount} comments •{" "}
                        {post.views} views
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={themedStyles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => handleLike(post._id)}
                        style={themedStyles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Heart
                          color={
                            post.isLikedByUser
                              ? colors.red
                              : colors.textSecondary
                          }
                          size={22}
                          fill={post.isLikedByUser ? colors.red : "transparent"}
                        />
                        <Text
                          style={[
                            themedStyles.actionText,
                            post.isLikedByUser && { color: colors.red },
                          ]}
                        >
                          {post.likeCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleComment(post._id)}
                        style={themedStyles.actionButton}
                        activeOpacity={0.7}
                      >
                        <MessageCircle color={colors.textSecondary} size={22} />
                        <Text style={themedStyles.actionText}>
                          {post.commentCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShare(post._id)}
                        style={themedStyles.actionButton}
                        activeOpacity={0.7}
                      >
                        <ExternalLink color={colors.textSecondary} size={22} />
                      </TouchableOpacity>

                      <View style={themedStyles.viewsContainer}>
                        <Eye color={colors.textSecondary} size={18} />
                        <Text style={themedStyles.viewsText}>{post.views}</Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}

              {/* Loading More Indicator */}
              {loadingMore && (
                <View style={themedStyles.loadingMore}>
                  <Text style={themedStyles.loadingMoreText}>
                    Loading more posts...
                  </Text>
                </View>
              )}

              {/* End of Posts Indicator */}
              {!hasMore && posts.length > 0 && (
                <View style={themedStyles.endOfPosts}>
                  <Text style={themedStyles.endOfPostsText}>
                    You are all caught up! 🎉
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Card style={themedStyles.emptyCard}>
              <CardContent style={themedStyles.emptyContent}>
                <View style={themedStyles.emptyIcon}>
                  <Plus color={colors.textSecondary} size={48} />
                </View>
                <Text style={themedStyles.emptyTitle}>No posts yet</Text>
                <Text style={themedStyles.emptyDescription}>
                  Be the first to share something amazing!
                </Text>
                <TouchableOpacity style={themedStyles.emptyAction}>
                  <Text style={themedStyles.emptyActionText}>Create Post</Text>
                </TouchableOpacity>
              </CardContent>
            </Card>
          )}
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
      elevation: 3,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    feed: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    postCard: {
      marginBottom: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
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
    friendAvatar: {
      width: 40,
      height: 40,
      borderColor: colors.primary,
      shadowOpacity: 0.15,
      shadowColor: colors.primary,
      borderWidth: 1.5,
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 7,
    },
    friendInitial: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "bold",
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      borderWidth: 2,
      borderColor: colors.primary + "30",
    },
    authorText: {
      flex: 1,
    },
    name: {
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
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
      fontWeight: "500",
    },
    timestamp: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    moreButton: {
      padding: 8,
      borderRadius: 20,
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
      fontWeight: "500",
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 8,
      borderRadius: 20,
    },
    viewsContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: "auto",
      paddingHorizontal: 8,
    },
    viewsText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
      fontWeight: "500",
    },
    actionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 6,
      fontWeight: "500",
    },
    emptyCard: {
      marginTop: 50,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
    },
    emptyContent: {
      padding: 40,
      alignItems: "center",
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 22,
    },
    emptyAction: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    emptyActionText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    loadingMore: {
      paddingVertical: 20,
      alignItems: "center",
    },
    loadingMoreText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    endOfPosts: {
      paddingVertical: 20,
      alignItems: "center",
    },
    endOfPostsText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "500",
    },
  });

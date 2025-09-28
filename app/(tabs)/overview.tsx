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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  getDashboardData,
  getPosts,
  likePost,
  commentOnPost,
  followUser,
  unfollowUser,
  getPostWithComments,
  likeComment,
} from "@/lib/api";
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
  X,
  Send,
  UserPlus,
  UserMinus,
  UserCheck,
  ArrowLeft,
  Reply,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  clearPostsCache,
  getPostsCache,
  savePostsCache,
  getUserData,
} from "@/lib/auth-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  likeCount: number;
  isLikedByUser?: boolean;
  replies?: Comment[];
  parentComment?: string;
}

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
  comments?: Comment[];
  isFollowingCreator?: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  coins: number;
  referralCount: number;
}

interface FullPostModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onPostUpdate: (postId: string, updates: Partial<Post>) => void;
  currentUserId: string | null;
  colors: ThemeContextType["colors"];
}

const FullPostModal = ({
  visible,
  onClose,
  post: initialPost,
  onPostUpdate,
  currentUserId,
  colors,
}: FullPostModalProps) => {
  const [post, setPost] = useState<Post | null>(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (visible && initialPost) {
      setPost(initialPost);
      loadFullPost();
    }
  }, [visible, initialPost]);

  const loadFullPost = async () => {
    if (!initialPost) return;
    setLoading(true);
    try {
      const result = await getPostWithComments(initialPost._id);
      if (result.success && result.data?.image) {
        const fullPost = result.data.image;
        setPost(fullPost);
        setComments(fullPost.comments || []);
      }
    } catch (error) {
      console.error("Failed to load full post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    const wasLiked = post.isLikedByUser;
    const newLikeCount = wasLiked ? post.likeCount - 1 : post.likeCount + 1;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            isLikedByUser: !wasLiked,
            likeCount: newLikeCount,
          }
        : null
    );

    try {
      const result = await likePost(post._id);
      if (result.success) {
        const updatedPost = {
          ...post,
          isLikedByUser: result.data?.isLiked,
          likeCount: result.data?.likeCount,
        };
        setPost(updatedPost);
        onPostUpdate(post._id, updatedPost);
      } else {
        // Revert on failure
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isLikedByUser: wasLiked,
                likeCount: post.likeCount,
              }
            : null
        );
      }
    } catch (error: any) {
      // Revert on error
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLikedByUser: wasLiked,
              likeCount: post.likeCount,
            }
          : null
      );
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    if (!post || !currentUserId) return;

    const wasFollowing = post.isFollowingCreator;

    // Optimistic update
    setPost((prev) =>
      prev
        ? {
            ...prev,
            isFollowingCreator: !wasFollowing,
          }
        : null
    );

    try {
      const result = wasFollowing
        ? await unfollowUser(post.createdBy._id)
        : await followUser(post.createdBy._id);

      if (result.success) {
        const updatedPost = {
          ...post,
          isFollowingCreator: !wasFollowing,
        };
        setPost(updatedPost);
        onPostUpdate(post._id, updatedPost);
      } else {
        // Revert on failure
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isFollowingCreator: wasFollowing,
              }
            : null
        );
      }
    } catch (error: any) {
      // Revert on error
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isFollowingCreator: wasFollowing,
            }
          : null
      );
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || submitting) return;

    setSubmitting(true);
    try {
      const result = await commentOnPost(post._id, newComment.trim());
      if (result.success) {
        const newCommentObj: Comment = {
          _id: result.data?.comment?._id || Date.now().toString(),
          user: {
            _id: currentUserId || "",
            name: "You",
            email: "",
          },
          userName: "You",
          userEmail: "",
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLikedByUser: false,
          replies: [],
        };

        setComments((prev) => [...prev, newCommentObj]);
        setNewComment("");

        // Update post comment count
        const updatedPost = {
          ...post,
          commentCount: (post.commentCount || 0) + 1,
        };
        setPost(updatedPost);
        onPostUpdate(post._id, { commentCount: updatedPost.commentCount });

        toast({
          title: "Success",
          description: "Comment added successfully!",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLikedByUser: !comment.isLikedByUser,
                likeCount: comment.isLikedByUser
                  ? (comment.likeCount || 0) - 1
                  : (comment.likeCount || 0) + 1,
              }
            : comment
        )
      );

      // Here you would call your API to like the comment
      // const result = await likeComment(commentId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const submitReply = async () => {
    if (!replyText.trim() || !replyingTo || !post) return;

    try {
      // Here you would call your API to add a reply
      // For now, we'll add it locally
      const newReply: Comment = {
        _id: Date.now().toString(),
        user: {
          _id: currentUserId || "",
          name: "You",
          email: "",
        },
        userName: "You",
        userEmail: "",
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLikedByUser: false,
        parentComment: replyingTo,
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === replyingTo
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              }
            : comment
        )
      );

      setReplyText("");
      setReplyingTo(null);

      toast({
        title: "Success",
        description: "Reply added successfully!",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    }
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

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={getModalStyles(colors).commentContainer}>
      <View style={getModalStyles(colors).commentItem}>
        <View style={getModalStyles(colors).commentAvatar}>
          <Text style={getModalStyles(colors).commentAvatarText}>
            {comment.userName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <View style={getModalStyles(colors).commentContent}>
          <View style={getModalStyles(colors).commentHeader}>
            <Text style={getModalStyles(colors).commentAuthor}>
              {comment.userName}
            </Text>
            <Text style={getModalStyles(colors).commentTime}>
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </View>
          <Text style={getModalStyles(colors).commentText}>
            {comment.content}
          </Text>

          <View style={getModalStyles(colors).commentActions}>
            <TouchableOpacity
              style={getModalStyles(colors).commentAction}
              onPress={() => handleLikeComment(comment._id)}
            >
              <Heart
                color={
                  comment.isLikedByUser ? colors.red : colors.textSecondary
                }
                size={14}
                fill={comment.isLikedByUser ? colors.red : "transparent"}
              />
              {(comment.likeCount || 0) > 0 && (
                <Text style={getModalStyles(colors).commentActionText}>
                  {comment.likeCount}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={getModalStyles(colors).commentAction}
              onPress={() => handleReply(comment._id)}
            >
              <Reply color={colors.textSecondary} size={14} />
              <Text style={getModalStyles(colors).commentActionText}>
                Reply
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reply input for this comment */}
          {replyingTo === comment._id && (
            <View style={getModalStyles(colors).replyInput}>
              <TextInput
                style={getModalStyles(colors).replyTextInput}
                placeholder="Write a reply..."
                placeholderTextColor={colors.textSecondary}
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={300}
              />
              <View style={getModalStyles(colors).replyActions}>
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                  style={getModalStyles(colors).replyCancel}
                >
                  <Text style={getModalStyles(colors).replyCancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitReply}
                  disabled={!replyText.trim()}
                  style={[
                    getModalStyles(colors).replySubmit,
                    !replyText.trim() &&
                      getModalStyles(colors).replySubmitDisabled,
                  ]}
                >
                  <Text style={getModalStyles(colors).replySubmitText}>
                    Reply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <View style={getModalStyles(colors).repliesContainer}>
              {comment.replies.map((reply) => (
                <View key={reply._id} style={getModalStyles(colors).replyItem}>
                  <View style={getModalStyles(colors).replyAvatar}>
                    <Text style={getModalStyles(colors).replyAvatarText}>
                      {reply.userName?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                  <View style={getModalStyles(colors).replyContent}>
                    <View style={getModalStyles(colors).replyHeader}>
                      <Text style={getModalStyles(colors).replyAuthor}>
                        {reply.userName}
                      </Text>
                      <Text style={getModalStyles(colors).replyTime}>
                        {formatTimeAgo(reply.createdAt)}
                      </Text>
                    </View>
                    <Text style={getModalStyles(colors).replyText}>
                      {reply.content}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={getModalStyles(colors).modalContainer}>
        {/* Header */}
        <View style={getModalStyles(colors).header}>
          <TouchableOpacity
            onPress={onClose}
            style={getModalStyles(colors).backButton}
          >
            <ArrowLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={getModalStyles(colors).headerTitle}>Post</Text>
          <TouchableOpacity style={getModalStyles(colors).moreButton}>
            <MoreHorizontal color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={getModalStyles(colors).content}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Header */}
          <View style={getModalStyles(colors).postHeader}>
            <View style={getModalStyles(colors).authorInfo}>
              <View style={getModalStyles(colors).authorAvatar}>
                <Text style={getModalStyles(colors).authorInitial}>
                  {post.createdBy.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <View style={getModalStyles(colors).authorText}>
                <View style={getModalStyles(colors).authorNameRow}>
                  <Text style={getModalStyles(colors).authorName}>
                    {post.createdBy.name}
                  </Text>
                  <ShieldCheck color={colors.primary} size={16} />
                </View>
                <View style={getModalStyles(colors).timestampContainer}>
                  <Text style={getModalStyles(colors).username}>
                    @{post.createdBy.referralCode || "user"}
                  </Text>
                  <Text style={getModalStyles(colors).timestamp}>
                    • {formatTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Follow Button */}
            {currentUserId && currentUserId !== post.createdBy._id && (
              <TouchableOpacity
                onPress={handleFollow}
                style={[
                  getModalStyles(colors).followButton,
                  post.isFollowingCreator
                    ? getModalStyles(colors).followingButton
                    : getModalStyles(colors).followButtonDefault,
                ]}
              >
                <Text
                  style={[
                    getModalStyles(colors).followButtonText,
                    post.isFollowingCreator && { color: colors.primary },
                  ]}
                >
                  {post.isFollowingCreator ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Post Content */}
          {post.content && (
            <Text style={getModalStyles(colors).postText}>{post.content}</Text>
          )}

          {/* Post Image */}
          <Image
            source={{ uri: post.url }}
            style={getModalStyles(colors).postImage}
            resizeMode="contain"
          />

          {/* Engagement Stats */}
          <View style={getModalStyles(colors).engagementStats}>
            <Text style={getModalStyles(colors).statText}>
              {post.likeCount} likes • {post.commentCount} comments •{" "}
              {post.views} views
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={getModalStyles(colors).actionButtons}>
            <TouchableOpacity
              onPress={handleLike}
              style={getModalStyles(colors).actionButton}
            >
              <Heart
                color={post.isLikedByUser ? colors.red : colors.textSecondary}
                size={24}
                fill={post.isLikedByUser ? colors.red : "transparent"}
              />
              <Text
                style={[
                  getModalStyles(colors).actionText,
                  post.isLikedByUser && { color: colors.red },
                ]}
              >
                {post.likeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={getModalStyles(colors).actionButton}>
              <MessageCircle color={colors.textSecondary} size={24} />
              <Text style={getModalStyles(colors).actionText}>
                {post.commentCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={getModalStyles(colors).actionButton}>
              <ExternalLink color={colors.textSecondary} size={24} />
            </TouchableOpacity>

            <View style={getModalStyles(colors).viewsContainer}>
              <Eye color={colors.textSecondary} size={20} />
              <Text style={getModalStyles(colors).viewsText}>{post.views}</Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={getModalStyles(colors).commentsSection}>
            <Text style={getModalStyles(colors).commentsTitle}>
              Comments ({comments.length})
            </Text>

            {loading ? (
              <View style={getModalStyles(colors).loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : comments.length > 0 ? (
              <FlatList
                data={comments}
                keyExtractor={(item) => item._id}
                renderItem={renderComment}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                  <View style={getModalStyles(colors).commentSeparator} />
                )}
              />
            ) : (
              <View style={getModalStyles(colors).emptyComments}>
                <MessageCircle color={colors.textSecondary} size={48} />
                <Text style={getModalStyles(colors).emptyCommentsText}>
                  No comments yet
                </Text>
                <Text style={getModalStyles(colors).emptyCommentsSubtext}>
                  Be the first to share your thoughts!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={getModalStyles(colors).commentInputContainer}
        >
          <View style={getModalStyles(colors).commentInputWrapper}>
            <TextInput
              style={getModalStyles(colors).commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              editable={!submitting}
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!newComment.trim() || submitting}
              style={[
                getModalStyles(colors).sendButton,
                (!newComment.trim() || submitting) &&
                  getModalStyles(colors).sendButtonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Send
                  color={
                    newComment.trim() ? colors.white : colors.textSecondary
                  }
                  size={20}
                />
              )}
            </TouchableOpacity>
          </View>
          <Text style={getModalStyles(colors).characterCount}>
            {newComment.length}/500
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default function OverviewScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fullPostModalVisible, setFullPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { colors } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await getUserData();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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
    // Load from cache first for instant display
    if (pageNum === 1 && !isRefresh && posts.length === 0) {
      try {
        const cachedPosts = await getPostsCache();
        if (cachedPosts?.posts && cachedPosts.posts.length > 0) {
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
            comments: image.comments || [],
            isFollowingCreator: image.isFollowingCreator || false,
          }));

          setPosts(transformedPosts);
          setLoading(false);
        }
      } catch (error) {
        console.log("Cache load failed:", error);
      }
    }

    if (pageNum > 1) setLoadingMore(true);

    try {
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
          comments: image.comments || [],
          isFollowingCreator: image.isFollowingCreator || false,
        }));

        if (isRefresh || pageNum === 1) {
          setPosts(newPosts);
          if (pageNum === 1) {
            await savePostsCache(newPosts, pageNum);
          }
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }

        setHasMore(postsResult.data.pagination?.hasMore || false);
      } else {
        if (pageNum === 1) {
          setPosts([]);
        }
      }
    } catch (error: any) {
      console.error("API Error:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      if (pageNum > 1) setLoadingMore(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const dashboardPromise = fetchDashboardData();
      const postsPromise = fetchPosts(1);
      await Promise.allSettled([dashboardPromise, postsPromise]);
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setPage(1);
    await clearPostsCache();
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
    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    const wasLiked = post.isLikedByUser;
    const newLikeCount = wasLiked ? post.likeCount - 1 : post.likeCount + 1;

    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId
          ? {
              ...p,
              isLikedByUser: !wasLiked,
              likeCount: newLikeCount,
            }
          : p
      )
    );

    try {
      const result = await likePost(postId);

      if (result.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  isLikedByUser: result.data?.isLiked,
                  likeCount: result.data?.likeCount,
                }
              : p
          )
        );
      } else {
        // Revert on failure
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  isLikedByUser: wasLiked,
                  likeCount: post.likeCount,
                }
              : p
          )
        );
      }
    } catch (error: any) {
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? {
                ...p,
                isLikedByUser: wasLiked,
                likeCount: post.likeCount,
              }
            : p
        )
      );

      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async (
    userId: string,
    isCurrentlyFollowing: boolean
  ) => {
    // Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.createdBy._id === userId
          ? { ...post, isFollowingCreator: !isCurrentlyFollowing }
          : post
      )
    );

    try {
      const result = isCurrentlyFollowing
        ? await unfollowUser(userId)
        : await followUser(userId);

      if (result.success) {
        toast({
          title: "Success",
          description: isCurrentlyFollowing
            ? "Successfully unfollowed user"
            : "Successfully followed user",
          variant: "success",
        });
      } else {
        throw new Error(result.message || "Failed to update follow status");
      }
    } catch (error: any) {
      // Revert optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.createdBy._id === userId
            ? { ...post, isFollowingCreator: isCurrentlyFollowing }
            : post
        )
      );

      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handleOpenFullPost = (post: Post) => {
    setSelectedPost(post);
    setFullPostModalVisible(true);
  };

  const handlePostUpdate = (postId: string, updates: Partial<Post>) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, ...updates } : post
      )
    );
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
                      <View style={themedStyles.headerActions}>
                        {/* Follow Button */}
                        {currentUserId &&
                          currentUserId !== post.createdBy._id && (
                            <TouchableOpacity
                              onPress={() =>
                                handleFollow(
                                  post.createdBy._id,
                                  post.isFollowingCreator || false
                                )
                              }
                              style={[
                                themedStyles.followButton,
                                post.isFollowingCreator
                                  ? themedStyles.followingButton
                                  : themedStyles.followButtonDefault,
                              ]}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  themedStyles.followButtonText,
                                  post.isFollowingCreator && {
                                    color: colors.primary,
                                  },
                                ]}
                              >
                                {post.isFollowingCreator
                                  ? "Following"
                                  : "Follow"}
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    </View>

                    {/* Post Content */}
                    {post.content && (
                      <Text
                        style={themedStyles.postText}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {post.content}
                      </Text>
                    )}

                    {/* Post Image - Tappable for full view */}
                    <TouchableOpacity onPress={() => handleOpenFullPost(post)}>
                      <Image
                        source={{ uri: post.url }}
                        style={themedStyles.postImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

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
                        onPress={() => handleOpenFullPost(post)}
                        style={themedStyles.actionButton}
                        activeOpacity={0.7}
                      >
                        <MessageCircle color={colors.textSecondary} size={22} />
                        <Text style={themedStyles.actionText}>
                          {post.commentCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
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
                  <ActivityIndicator size="large" color={colors.primary} />
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

      {/* Full Post Modal */}
      <FullPostModal
        visible={fullPostModalVisible}
        onClose={() => {
          setFullPostModalVisible(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        onPostUpdate={handlePostUpdate}
        currentUserId={currentUserId}
        colors={colors}
      />
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
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
    },
    followButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "transparent",
      marginRight: 2,
    },
    followButtonDefault: {
      backgroundColor: colors.primary,
    },
    followingButton: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    followButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
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
      gap: 12,
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

const getModalStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    moreButton: {
      padding: 8,
      borderRadius: 20,
    },
    content: {
      flex: 1,
    },
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    authorInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    authorAvatar: {
      width: 44,
      height: 44,
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.cardBackground,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    authorInitial: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "bold",
    },
    authorText: {
      flex: 1,
    },
    authorNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
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
    followButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    followButtonDefault: {
      backgroundColor: colors.primary,
    },
    followingButton: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    followButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
    },
    postText: {
      fontSize: 16,
      color: colors.textPrimary,
      lineHeight: 24,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    postImage: {
      width: screenWidth,
      height: screenWidth,
      marginBottom: 16,
    },
    engagementStats: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 12,
    },
    statText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 16,
      borderRadius: 20,
    },
    actionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 6,
      fontWeight: "500",
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
    commentsSection: {
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    commentsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 16,
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
    },
    commentContainer: {
      marginBottom: 16,
    },
    commentItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },
    commentAvatarText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      gap: 8,
    },
    commentAuthor: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    commentTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    commentText: {
      fontSize: 15,
      color: colors.textPrimary,
      lineHeight: 22,
      marginBottom: 8,
    },
    commentActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    commentAction: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      gap: 4,
    },
    commentActionText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    replyInput: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    replyTextInput: {
      fontSize: 14,
      color: colors.textPrimary,
      minHeight: 40,
      textAlignVertical: "top",
      marginBottom: 8,
    },
    replyActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
    replyCancel: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    replyCancelText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    replySubmit: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.primary,
    },
    replySubmitDisabled: {
      backgroundColor: colors.textSecondary + "40",
    },
    replySubmitText: {
      fontSize: 14,
      color: colors.white,
      fontWeight: "600",
    },
    repliesContainer: {
      marginTop: 12,
      marginLeft: 16,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
      paddingLeft: 12,
    },
    replyItem: {
      flexDirection: "row",
      marginBottom: 12,
    },
    replyAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    replyAvatarText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    replyContent: {
      flex: 1,
    },
    replyHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 6,
    },
    replyAuthor: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    replyTime: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    replyText: {
      fontSize: 14,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    commentSeparator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    emptyComments: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyCommentsText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyCommentsSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    commentInputContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.cardBackground,
      paddingBottom: Platform.OS === "ios" ? 0 : 16,
    },
    commentInputWrapper: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 12,
    },
    commentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      color: colors.textPrimary,
      fontSize: 16,
      maxHeight: 100,
      minHeight: 44,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    sendButtonDisabled: {
      backgroundColor: colors.textSecondary + "40",
    },
    characterCount: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "right",
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 4,
    },
  });

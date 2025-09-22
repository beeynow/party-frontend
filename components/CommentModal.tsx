// components/CommentsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/components/theme-context";
import type { ThemeContextType } from "@/components/theme-context";
import { useToast } from "@/components/ui/use-toast";
import {
  X,
  Send,
  MessageCircle,
  Heart,
  MoreHorizontal,
} from "lucide-react-native";
import { getPostWithComments, commentOnPostEnhanced } from "@/lib/api";

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
  isLiked?: boolean;
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
  comments?: Comment[];
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onCommentAdded: (postId: string, newCommentCount: number) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  post,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    if (visible && post) {
      loadComments();
    }
  }, [visible, post]);

  const loadComments = async () => {
    if (!post) return;

    setLoading(true);
    try {
      const result = await getPostWithComments(post._id);

      if (result.success && result.data?.image?.comments) {
        setComments(result.data.image.comments);
      } else {
        setComments(post.comments || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments(post.comments || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post || submitting) return;

    setSubmitting(true);
    try {
      const result = await commentOnPostEnhanced(post._id, newComment.trim());

      if (result.success) {
        // Add the new comment to the list
        const newCommentObj: Comment = {
          _id: result.data?.comment?._id || Date.now().toString(),
          user: {
            _id: result.data?.comment?.user?.id || "",
            name: result.data?.comment?.user?.name || "You",
            email: result.data?.comment?.user?.email || "",
          },
          userName: result.data?.comment?.user?.name || "You",
          userEmail: result.data?.comment?.user?.email || "",
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
        };

        setComments((prevComments) => [...prevComments, newCommentObj]);
        setNewComment("");

        // Notify parent component about the new comment
        onCommentAdded(
          post._id,
          result.data?.commentCount || comments.length + 1
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
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadComments();
    setRefreshing(false);
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
    <View style={getStyles(colors).commentItem}>
      <View style={getStyles(colors).commentAvatar}>
        <Text style={getStyles(colors).commentAvatarText}>
          {comment.userName?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View style={getStyles(colors).commentContent}>
        <View style={getStyles(colors).commentHeader}>
          <Text style={getStyles(colors).commentAuthor}>
            {comment.userName}
          </Text>
          <Text style={getStyles(colors).commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </View>
        <Text style={getStyles(colors).commentText}>{comment.content}</Text>
        <View style={getStyles(colors).commentActions}>
          <TouchableOpacity style={getStyles(colors).commentAction}>
            <Heart
              color={comment.isLiked ? colors.red : colors.textSecondary}
              size={14}
              fill={comment.isLiked ? colors.red : "transparent"}
            />
            {comment.likeCount > 0 && (
              <Text style={getStyles(colors).commentActionText}>
                {comment.likeCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={getStyles(colors).emptyComments}>
      <MessageCircle color={colors.textSecondary} size={48} />
      <Text style={getStyles(colors).emptyCommentsText}>No comments yet</Text>
      <Text style={getStyles(colors).emptyCommentsSubtext}>
        Be the first to share your thoughts!
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={getStyles(colors).modalContainer}>
        {/* Header */}
        <View style={getStyles(colors).modalHeader}>
          <Text style={getStyles(colors).modalTitle}>
            Comments ({comments.length})
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={getStyles(colors).closeButton}
          >
            <X color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        {loading ? (
          <View style={getStyles(colors).loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={getStyles(colors).loadingText}>
              Loading comments...
            </Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            style={getStyles(colors).commentsList}
            contentContainerStyle={getStyles(colors).commentsContent}
            renderItem={renderComment}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Comment Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={getStyles(colors).commentInputContainer}
        >
          <View style={getStyles(colors).commentInputWrapper}>
            <TextInput
              style={getStyles(colors).commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              editable={!submitting}
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              style={[
                getStyles(colors).sendButton,
                (!newComment.trim() || submitting) &&
                  getStyles(colors).sendButtonDisabled,
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
          <Text style={getStyles(colors).characterCount}>
            {newComment.length}/500
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const getStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    commentsList: {
      flex: 1,
    },
    commentsContent: {
      padding: 20,
      paddingBottom: 40,
    },
    commentItem: {
      flexDirection: "row",
      marginBottom: 20,
      alignItems: "flex-start",
    },
    commentAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
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
    },
    commentAction: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginRight: 12,
      borderRadius: 12,
      gap: 4,
    },
    commentActionText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
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
      paddingBottom: Platform.OS === "ios" ? 0 : 20,
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

export default CommentsModal;

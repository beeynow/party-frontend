const ROUTE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

const BACKEND_BASE_URL = `${ROUTE_URL}/api/auth`;
const REFERRAL_BASE_URL = `${ROUTE_URL}/api/referral`;
const IMAGES_BASE_URL = `${ROUTE_URL}/api/images`;
const SOCIAL_BASE_URL = `${ROUTE_URL}/api/social`;

import {
  getAuthToken,
  getUserData,
  saveAuthToken,
  saveUserData,
} from "./auth-storage";

export async function handleApiResponse(response: Response) {
  const text = await response.text(); // get raw response first
  console.log("🔍 Raw response:", text);

  let result;
  try {
    result = JSON.parse(text);
  } catch (err) {
    throw new Error("Invalid JSON format: " + text);
  }

  if (!response.ok) {
    throw new Error(result.message || `HTTP error! status: ${response.status}`);
  }

  return result;
}

// Fixed API functions for referral system

export async function verifyReferralCode(referralCode: string) {
  try {
    console.log("🔍 Verifying referral code:", referralCode);

    const response = await fetch(
      `${REFERRAL_BASE_URL}/verify/${referralCode.trim().toUpperCase()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📡 Referral verification response status:", response.status);

    const result = await handleApiResponse(response);
    console.log("✅ Referral verification result:", result);

    return {
      valid: result.valid || false,
      message: result.message || "Unknown error",
      referrer: result.data?.referrer || null,
    };
  } catch (error: any) {
    console.error("❌ Error verifying referral code:", error);
    return {
      valid: false,
      message: error.message || "Error verifying referral code",
      referrer: null,
    };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}) {
  try {
    console.log("📤 Registration request:", {
      name: data.name,
      email: data.email,
      hasPassword: !!data.password,
      referralCode: data.referralCode || "none",
    });

    // Clean and validate referral code if provided
    const cleanData = {
      ...data,
      ...(data.referralCode && {
        referralCode: data.referralCode.trim().toUpperCase(),
      }),
    };

    console.log("clean: ", cleanData);

    const response = await fetch(`${BACKEND_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanData),
    });

    console.log("📡 Registration response status:", response);

    const result = await handleApiResponse(response);
    console.log("✅ Registration result:", result);

    return {
      success: true,
      message: result.message || "Registration successful!",
      data: result.data,
      referredBy: result.data?.referredBy || null,
    };
  } catch (error: any) {
    console.error("❌ Registration Error:", error);

    // Enhanced error handling for referral issues
    let errorMessage =
      error.message ||
      "Network error. Please check your connection and try again.";

    if (errorMessage.includes("referral")) {
      errorMessage = "Invalid referral code. Please check and try again.";
    } else if (errorMessage.includes("email")) {
      errorMessage =
        "This email is already registered. Try logging in instead.";
    } else if (errorMessage.includes("password")) {
      errorMessage = "Password must meet security requirements.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getReferralStats() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    console.log("📡 Fetching referral stats...");

    const response = await fetch(`${REFERRAL_BASE_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("✅ Referral stats retrieved:", {
      hasData: !!result.data,
      userCode: result.data?.user?.referralCode,
      totalReferrals: result.data?.totals?.referralCount,
      totalCoins: result.data?.totals?.totalCoins,
    });

    // Ensure data structure consistency
    if (result.data) {
      // Fix referral history structure
      if (result.data.history?.referralHistory) {
        result.data.history.referralHistory =
          result.data.history.referralHistory.map((ref: any) => ({
            ...ref,
            referredUser: ref.referredUser || {
              name: ref.referredUserName || "Unknown User",
              email: ref.referredUserEmail || "",
              createdAt: ref.referredAt || new Date().toISOString(),
            },
          }));
      }
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Error getting referral stats:", error);
    return {
      success: false,
      message: error.message || "Failed to load referral data",
      data: {
        user: { referralCode: "" },
        totals: { referralCount: 0, totalCoins: 0 },
        history: { referralHistory: [] },
        sharing: { referralLink: "", qrCodeUrl: "" },
      },
    };
  }
}

export async function verifyOtp(data: { email: string; otp: string }) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse(response);

    if (result.token) {
      await saveAuthToken(result.token);
      if (result.user) {
        await saveUserData(result.user);
      }
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    return {
      success: false,
      message: error.message || "Failed to verify OTP. Please try again.",
    };
  }
}

export async function resendOtp(data: { email: string }) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return {
      success: false,
      message: error.message || "Failed to resend OTP. Please try again.",
    };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse(response);
    console.log("Login Response:", result);

    if (result.token) {
      await saveAuthToken(result.token);
      console.log("✅ Token saved successfully");

      if (result.user) {
        const userDataToStore = {
          ...result.user, // <-- use result.user instead of userFromLogin
          is_admin: result.user.is_admin,
          adminConfirmed: result.user.adminConfirmed,
        };

        await saveUserData(userDataToStore);

        // 🔍 Verify retrieval from storage
        const cachedUser = await getUserData();
        console.log("🔁 Retrieved user from storage:", cachedUser);
      }
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Login Error:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
      token: null,
    };
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Logout Error:", error);
    return {
      success: false,
      message: error.message || "Failed to logout. Please try again.",
    };
  }
}

export async function getDashboardData() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(`${BACKEND_BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("dashboard data: ", result);

    if (result.user) {
      const existingUserData = await getUserData();
      const updatedUserData = {
        ...result.user,
        // Preserve admin fields from existing data if they exist
        is_admin: result.user.is_admin ?? existingUserData?.is_admin ?? false,
        adminConfirmed:
          result.user.adminConfirmed ??
          existingUserData?.adminConfirmed ??
          false,
      };

      await saveUserData(updatedUserData);
      console.log(
        "🔄 Dashboard data updated, admin status preserved:",
        updatedUserData.is_admin
      );
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
    };
  }
}

export async function getReferralHistory(page = 1, limit = 10) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(
      `${REFERRAL_BASE_URL}/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting referral history:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
      data: [], // Added empty data array for fallback
    };
  }
}

export async function getReferralLeaderboard(limit = 10) {
  try {
    console.log(
      "[v0] Making leaderboard API call to:",
      `${REFERRAL_BASE_URL}/leaderboard?limit=${limit}`
    );

    const response = await fetch(
      `${REFERRAL_BASE_URL}/leaderboard?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[v0] Leaderboard API response status:", response.status);

    const result = await handleApiResponse(response);
    console.log("[v0] Leaderboard API result:", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting referral leaderboard:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
      data: [], // Added empty data array for fallback
    };
  }
}

export async function getTotalUserCount() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(`${BACKEND_BASE_URL}/users-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("data: ", result);
    console.log("data2: ", result?.data?.users?.active);
    console.log("data2: ", result?.data?.users?.total);
    console.log("data2: ", result?.data?.users?.verified);
    console.log("data2: ", result?.data?.registrations?.today);
    console.log("data2: ", result?.data?.users?.verificationRate);

    return {
      success: true,
      totalUsers: result.data?.users?.total || 0,
      verifiedUsers: result.data?.users?.verified || 0,
      activeUsers: result.data?.users?.active || 0,
      verificationRate: result.data?.users?.verificationRate || 0,
      registration: result.data?.registrations || 0,
    };
  } catch (error: any) {
    console.error("Error getting user count:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
      totalUsers: 0, // Fallback value
    };
  }
}

// Image/Post related API Functions
// EXACT FIX: Replace the uploadPost function in lib/api.ts

export async function uploadPost(data: {
  content: string;
  category?: string;
  tags?: string[];
  images: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
}) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    console.log("📤 Starting upload with data:", {
      contentLength: data.content.length,
      category: data.category,
      tagsCount: data.tags?.length || 0,
      imagesCount: data.images.length,
    });

    // Log each image before processing
    data.images.forEach((img, idx) => {
      console.log(`📸 Input image ${idx + 1}:`, {
        name: img.name,
        type: img.type,
        uri: img.uri.substring(0, 50) + "...",
      });
    });

    const formData = new FormData();

    // Add text fields
    formData.append("content", data.content);

    if (data.category) {
      formData.append("category", data.category);
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // CRITICAL FIX: Process images with proper React Native FormData format
    data.images.forEach((image, index) => {
      // Ensure proper MIME type
      let mimeType = image.type;
      if (!mimeType || mimeType === "image" || !mimeType.includes("/")) {
        const filename = image.name.toLowerCase();
        if (filename.endsWith(".png")) {
          mimeType = "image/png";
        } else if (filename.endsWith(".gif")) {
          mimeType = "image/gif";
        } else if (filename.endsWith(".webp")) {
          mimeType = "image/webp";
        } else {
          mimeType = "image/jpeg";
        }
      }

      // Create the file object in React Native format
      const fileObj = {
        uri: image.uri,
        type: mimeType,
        name: image.name,
      };

      console.log(`📎 Appending file ${index + 1}:`, fileObj);

      // CRITICAL: This is the correct way for React Native
      formData.append("images", fileObj as any);
    });

    console.log(
      "📤 FormData created, making request to:",
      `${IMAGES_BASE_URL}/upload`
    );

    const response = await fetch(`${IMAGES_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // IMPORTANT: Do NOT set Content-Type header for FormData in React Native
      },
      body: formData,
    });

    console.log("📤 Response status:", response.status, response.statusText);

    const result = await handleApiResponse(response);
    console.log("✅ Upload result:", result.success ? "SUCCESS" : "FAILED");

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Upload Error:", error.message);
    return {
      success: false,
      message: error.message || "Failed to upload post. Please try again.",
    };
  }
}

// ALTERNATIVE: If the above doesn't work, try this more explicit approach
export async function uploadPostAlternative(data: {
  content: string;
  category?: string;
  tags?: string[];
  images: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
}) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found.",
      };
    }

    // Create FormData step by step with explicit logging
    const formData = new FormData();

    console.log("📝 Adding content field");
    formData.append("content", data.content);

    if (data.category) {
      console.log("📝 Adding category field");
      formData.append("category", data.category);
    }

    if (data.tags && data.tags.length > 0) {
      console.log("📝 Adding tags field");
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Process each image individually
    for (let i = 0; i < data.images.length; i++) {
      const image = data.images[i];

      console.log(`📸 Processing image ${i + 1}/${data.images.length}`);

      // Fix MIME type if needed
      let correctedType = image.type;
      if (correctedType === "image" || !correctedType.includes("/")) {
        correctedType = "image/jpeg"; // Default fallback
        console.log("🔧 Corrected MIME type to:", correctedType);
      }

      // Create file object
      const fileData = {
        uri: image.uri,
        type: correctedType,
        name: image.name,
      };

      console.log(`📎 File object ${i + 1}:`, {
        name: fileData.name,
        type: fileData.type,
        uriValid: fileData.uri.startsWith("file://"),
      });

      // Append to FormData
      formData.append("images", fileData as any);
      console.log(`✅ Added image ${i + 1} to FormData`);
    }

    console.log("🚀 Sending request...");

    const response = await fetch(`${IMAGES_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("📡 Response:", response.status, response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server error:", errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("🎉 Success!");

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("💥 Error:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function getPostsWithFollowStatus(
  page = 1,
  limit = 20,
  category?: string
) {
  try {
    const token = await getAuthToken();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${IMAGES_BASE_URL}?${queryParams}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse(response);

    // Transform the posts to include follow status
    if (result.success && result.data?.images) {
      result.data.images = result.data.images.map((image: any) => ({
        ...image,
        isFollowingCreator: image.isFollowingCreator || false,
      }));
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting posts with follow status:", error);
    return {
      success: false,
      message: error.message || "Failed to load posts. Please try again.",
      data: { images: [], pagination: {} },
    };
  }
}

// Get user's follow status
export async function getFollowStatus(userId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
        isFollowing: false,
      };
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/users/${userId}/follow-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting follow status:", error);
    return {
      success: false,
      message: error.message || "Failed to get follow status.",
      data: {
        isFollowing: false,
        isFollowedBy: false,
        isMutual: false,
        isSelf: false,
      },
    };
  }
}

export async function getPostWithComments(postId: string) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse(response);

    if (result.success && result.data?.image) {
      // Ensure comments are properly formatted
      const image = result.data.image;
      image.comments = image.comments || [];
      image.isFollowingCreator = image.isFollowingCreator || false;
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting post with comments:", error);
    return {
      success: false,
      message: error.message || "Failed to load post details.",
    };
  }
}

export async function getPosts(page = 1, limit = 20, category?: string) {
  try {
    const token = await getAuthToken();
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${IMAGES_BASE_URL}?${queryParams}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting posts:", error);
    return {
      success: false,
      message: error.message || "Failed to load posts. Please try again.",
      data: { images: [], pagination: {} },
    };
  }
}

export async function getPostDetails(postId: string) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting post details:", error);
    return {
      success: false,
      message: error.message || "Failed to load post details.",
    };
  }
}

// 🔥 FIXED: Frontend API call - lib/api.ts
export async function likePost(postId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    console.log(`📡 Toggling like for post: ${postId}`);

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // 🔥 FIXED: Better response handling
    const result = await handleApiResponse(response);

    console.log("✅ Like API response:", {
      success: result.success,
      action: result.data?.action,
      likeCount: result.data?.likeCount,
      isLiked: result.data?.isLiked,
    });

    // 🔥 FIXED: Ensure consistent response format
    return {
      success: true,
      message: result.message,
      data: {
        action: result.data.action,
        likeCount: parseInt(result.data.likeCount) || 0, // Ensure it's a number
        isLiked: result.data.isLiked === true,
      },
    };
  } catch (error: any) {
    console.error("❌ Like post error:", error);
    return {
      success: false,
      message: error.message || "Failed to toggle like. Please try again.",
    };
  }
}

export async function commentOnPostEnhanced(postId: string, content: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: "Comment content is required",
      };
    }

    if (content.trim().length > 500) {
      return {
        success: false,
        message: "Comment is too long. Maximum 500 characters allowed.",
      };
    }

    console.log(`📡 Adding comment to post: ${postId}`);

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: content.trim() }),
    });

    const result = await handleApiResponse(response);
    console.log("✅ Comment API result:", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Comment post error:", error);
    return {
      success: false,
      message: error.message || "Failed to comment. Please try again.",
    };
  }
}

// Batch follow/unfollow operations
export async function batchFollowUsers(
  userIds: string[],
  action: "follow" | "unfollow"
) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const results = await Promise.allSettled(
      userIds.map((userId) =>
        action === "follow" ? followUser(userId) : unfollowUser(userId)
      )
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    return {
      success: successful > 0,
      message: `${
        action === "follow" ? "Followed" : "Unfollowed"
      } ${successful} out of ${userIds.length} users`,
      data: {
        total: userIds.length,
        successful,
        failed: userIds.length - successful,
      },
    };
  } catch (error: any) {
    console.error(`❌ Batch ${action} error:`, error);
    return {
      success: false,
      message: error.message || `Failed to ${action} users. Please try again.`,
    };
  }
}

// Get suggested users to follow
export async function getSuggestedUsers(limit = 10) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
        data: { suggestions: [] },
      };
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/suggestions/follow?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting suggested users:", error);
    return {
      success: false,
      message: error.message || "Failed to load suggested users.",
      data: { suggestions: [] },
    };
  }
}

export async function commentOnPost(postId: string, content: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: "Comment content is required",
      };
    }

    console.log(`📡 Adding comment to post: ${postId}`);
    console.log(`📝 Comment content: ${content.substring(0, 50)}...`);

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: content.trim() }),
    });

    const result = await handleApiResponse(response);
    console.log("✅ Comment API result:", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Comment post error:", error);
    return {
      success: false,
      message: error.message || "Failed to comment. Please try again.",
    };
  }
}

export async function deleteComment(postId: string, commentId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(
      `${IMAGES_BASE_URL}/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      message: error.message || "Failed to delete comment. Please try again.",
    };
  }
}

export async function deletePost(postId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      message: error.message || "Failed to delete post. Please try again.",
    };
  }
}

export async function getUserPosts(page = 1, limit = 20) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(
      `${IMAGES_BASE_URL}/user/my-images?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting user posts:", error);
    return {
      success: false,
      message: error.message || "Failed to load your posts. Please try again.",
      data: { images: [], pagination: {} },
    };
  }
}

// Social API Functions
export async function followUser(userId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    console.log(`📡 Following user: ${userId}`);

    const response = await fetch(`${SOCIAL_BASE_URL}/follow/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("✅ Follow API result:", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Follow user error:", error);
    return {
      success: false,
      message: error.message || "Failed to follow user. Please try again.",
    };
  }
}

export async function unfollowUser(userId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    console.log(`📡 Unfollowing user: ${userId}`);

    const response = await fetch(`${SOCIAL_BASE_URL}/follow/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("✅ Unfollow API result:", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("❌ Unfollow user error:", error);
    return {
      success: false,
      message: error.message || "Failed to unfollow user. Please try again.",
    };
  }
}

export async function getSocialFeed(page = 1, limit = 20, timeframe = "week") {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/feed?page=${page}&limit=${limit}&timeframe=${timeframe}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting social feed:", error);
    return {
      success: false,
      message: error.message || "Failed to load social feed. Please try again.",
      data: { posts: [], pagination: {} },
    };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${SOCIAL_BASE_URL}/users/${userId}/profile`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      message: error.message || "Failed to load user profile.",
    };
  }
}

export async function searchUsers(query: string, page = 1, limit = 20) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/users/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message: error.message || "Failed to search users. Please try again.",
      data: { users: [], pagination: {} },
    };
  }
}

export async function getFollowers(userId: string, page = 1, limit = 20) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/users/${userId}/followers?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    const result = await handleApiResponse(response);
    console.log("your Followers are: ", result);
    console.log("your Followers are: ", result);
    console.log("your Followers are: ", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting followers:", error);
    return {
      success: false,
      message: error.message || "Failed to load followers.",
      data: { followers: [], pagination: {} },
    };
  }
}

export async function getFollowing(userId: string, page = 1, limit = 20) {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/users/${userId}/following?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    const result = await handleApiResponse(response);
    console.log("admin following are: ", result);
    console.log("admin following are: ", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting following:", error);
    return {
      success: false,
      message: error.message || "Failed to load following.",
      data: { following: [], pagination: {} },
    };
  }
}

export async function getAdminPosts(page = 1, limit = 20) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(
      `${IMAGES_BASE_URL}/admin/all?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);
    console.log("admin posts are: ", result);
    console.log("admin posts are: ", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting admin posts:", error);
    return {
      success: false,
      message: error.message || "Failed to load posts. Please try again.",
      data: [],
    };
  }
}

// Get suggested users to follow
export async function getFollowSuggestions(limit = 10) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
        data: { suggestions: [] },
      };
    }

    const response = await fetch(
      `${SOCIAL_BASE_URL}/suggestions/follow?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting follow suggestions:", error);
    return {
      success: false,
      message: error.message || "Failed to load follow suggestions.",
      data: { suggestions: [] },
    };
  }
}

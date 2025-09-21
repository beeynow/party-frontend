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

const handleApiResponse = async (response: Response) => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `HTTP error! status: ${response.status}`);
  }

  return result;
};

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/register`, {
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
    console.error("Registration Error:", error);
    return {
      success: false,
      message:
        error.message ||
        "Network error. Please check your connection and try again.",
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

// Referral API Functions
export async function verifyReferralCode(referralCode: string) {
  try {
    const response = await fetch(
      `${REFERRAL_BASE_URL}/verify/${referralCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleApiResponse(response);
    return result;
  } catch (error: any) {
    console.error("Error verifying referral code:", error);
    return {
      valid: false,
      message: error.message || "Error verifying referral code",
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

    const response = await fetch(`${REFERRAL_BASE_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await handleApiResponse(response);
    console.log("referral details: ", result);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error getting referral stats:", error);
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

    const formData = new FormData();

    // Add content and metadata
    formData.append("content", data.content);

    if (data.category) {
      formData.append("category", data.category);
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Add images to form data
    data.images.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    const response = await fetch(`${IMAGES_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - let React Native handle it
      },
      body: formData,
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Upload Error:", error);
    return {
      success: false,
      message: error.message || "Failed to upload post. Please try again.",
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

export async function likePost(postId: string) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please login again.",
      };
    }

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}/like`, {
      method: "POST",
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
    console.error("Error liking post:", error);
    return {
      success: false,
      message: error.message || "Failed to like post. Please try again.",
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

    const response = await fetch(`${IMAGES_BASE_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error("Error commenting on post:", error);
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

    const response = await fetch(`${SOCIAL_BASE_URL}/follow/${userId}`, {
      method: "POST",
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
    console.error("Error following user:", error);
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

    const response = await fetch(`${SOCIAL_BASE_URL}/follow/${userId}`, {
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
    console.error("Error unfollowing user:", error);
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

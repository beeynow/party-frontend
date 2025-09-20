const BACKEND_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000/api/auth";
const REFERRAL_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace("/api/auth", "/api/referral") ||
  "http://localhost:3000/api/referral";
const IMAGES_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace("/api/auth", "/api/images") ||
  "http://localhost:3000/api/images";

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
  title: string;
  description: string;
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
    formData.append("title", data.title);
    formData.append("description", data.description);

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
        "Content-Type": "multipart/form-data",
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

export async function getPosts(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${IMAGES_BASE_URL}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

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
      data: [],
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
      `${IMAGES_BASE_URL}/admin?page=${page}&limit=${limit}`,
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

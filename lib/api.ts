const BACKEND_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000/api/auth";

const REFERRAL_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace("/api/auth", "/api/referral") ||
  "http://localhost:3000/api/referral";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}) {
  const response = await fetch(`${BACKEND_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function verifyOtp(data: { email: string; otp: string }) {
  const response = await fetch(`${BACKEND_BASE_URL}/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function resendOtp(data: { email: string }) {
  const response = await fetch(`${BACKEND_BASE_URL}/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
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
    const res = await response.json();
    console.log("Login Response:", res);
    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return { message: "Network error", token: null };
  }
}

export async function logoutUser() {
  const response = await fetch(`${BACKEND_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function getDashboardData() {
  const token = await import("./auth-storage").then((m) => m.getAuthToken());
  const response = await fetch(`${BACKEND_BASE_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const result = await response.json();
  return result;
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
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error verifying referral code:", error);
    return { valid: false, message: "Error verifying referral code" };
  }
}

export async function getReferralStats() {
  const token = await import("./auth-storage").then((m) => m.getAuthToken());
  try {
    const response = await fetch(`${REFERRAL_BASE_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return { message: "Error getting referral stats" };
  }
}

export async function getReferralHistory(page: number = 1, limit: number = 10) {
  const token = await import("./auth-storage").then((m) => m.getAuthToken());
  try {
    const response = await fetch(
      `${REFERRAL_BASE_URL}/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting referral history:", error);
    return { message: "Error getting referral history" };
  }
}

export async function getReferralLeaderboard(limit: number = 10) {
  try {
    const response = await fetch(
      `${REFERRAL_BASE_URL}/leaderboard?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting referral leaderboard:", error);
    return { message: "Error getting referral leaderboard" };
  }
}

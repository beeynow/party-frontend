const BACKEND_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000/api/auth";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
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
  const startTime = Date.now(); // Record start time

  const token = await import("./auth-storage").then((m) => m.getAuthToken());
  const response = await fetch(`${BACKEND_BASE_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const result = await response.json();
  const endTime = Date.now(); // Record end time
  return result;
}

import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const saveAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("✅ Token saved successfully");
  } catch (error) {
    console.error("❌ Saving token failed:", error);
    throw new Error("Failed to save authentication token");
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log(
      "🔁 Token retrieved:",
      token ? "Token exists" : "No token found"
    );
    return token;
  } catch (error) {
    console.error("❌ Retrieving token failed:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    console.log("🗑️ Auth data cleared");
  } catch (error) {
    console.error("❌ Removing auth data failed:", error);
    throw new Error("Failed to clear authentication data");
  }
};

export const saveUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log("✅ User data cached");
  } catch (error) {
    console.error("❌ Saving user data failed:", error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("❌ Retrieving user data failed:", error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error("❌ Auth check failed:", error);
    return false;
  }
};

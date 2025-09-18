import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

export const saveAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("✅ Token saved:", token);
    console.log("✅ Token saved successfully");
  } catch (error) {
    console.error("❌ Saving token failed:", error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log("🔁 Token retrieved:", token);
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
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("🗑️ Token removed");
  } catch (error) {
    console.error("❌ Removing token failed:", error);
  }
};

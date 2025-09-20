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
    const existingData = await getUserData();
    const dataToSave = {
      ...userData,
      // Preserve admin fields if they exist in either new or existing data
      is_admin: userData.is_admin ?? existingData?.is_admin ?? false,
      adminConfirmed:
        userData.adminConfirmed ?? existingData?.adminConfirmed ?? false,
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(dataToSave));
    console.log("✅ User data cached with admin status:", dataToSave.is_admin);
  } catch (error) {
    console.error("❌ Saving user data failed:", error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);

    if (userData) {
      const parsed = JSON.parse(userData);
      console.log("🔁 User data retrieved (parsed):", parsed);
      return parsed;
    }

    console.log("⚠️ No user data found");
    return null;
  } catch (error) {
    console.error("❌ Retrieving user data failed:", error);
    return null;
  }
};

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();
    console.log("👤 Checking admin rights:", userData);

    return (
      userData && userData.is_admin === true && userData.adminConfirmed === true
    );
  } catch (error) {
    console.error("❌ Admin check failed:", error);
    return false;
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

export const getAdminStatus = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();
    const isAdmin =
      userData?.is_admin === true && userData?.adminConfirmed === true;
    console.log("🔍 Admin status check:", {
      is_admin: userData?.is_admin,
      adminConfirmed: userData?.adminConfirmed,
      result: isAdmin,
    });
    return isAdmin;
  } catch (error) {
    console.error("❌ Admin status check failed:", error);
    return false;
  }
};

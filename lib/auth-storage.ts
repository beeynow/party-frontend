import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";
const POSTS_CACHE_KEY = "posts_cache";
const SOCIAL_CACHE_KEY = "social_cache";

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
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
      POSTS_CACHE_KEY,
      SOCIAL_CACHE_KEY,
    ]);
    console.log("🗑️ Auth data and cache cleared");
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

// Posts cache functions
export const savePostsCache = async (posts: any[], page: number = 1) => {
  try {
    const cacheData = {
      posts,
      timestamp: Date.now(),
      page,
    };
    await AsyncStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(cacheData));
    console.log("✅ Posts cached successfully");
  } catch (error) {
    console.error("❌ Saving posts cache failed:", error);
  }
};

export const getPostsCache = async (): Promise<{
  posts: any[];
  timestamp: number;
  page: number;
} | null> => {
  try {
    const cacheData = await AsyncStorage.getItem(POSTS_CACHE_KEY);
    if (cacheData) {
      const parsed = JSON.parse(cacheData);

      // Check if cache is older than 5 minutes
      const isExpired = Date.now() - parsed.timestamp > 5 * 60 * 1000;

      if (isExpired) {
        console.log("⏰ Posts cache expired");
        return null;
      }

      console.log("🔁 Posts retrieved from cache");
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("❌ Retrieving posts cache failed:", error);
    return null;
  }
};

export const clearPostsCache = async () => {
  try {
    await AsyncStorage.removeItem(POSTS_CACHE_KEY);
    console.log("🗑️ Posts cache cleared");
  } catch (error) {
    console.error("❌ Clearing posts cache failed:", error);
  }
};

// Social data cache functions
export const saveSocialCache = async (data: any, key: string) => {
  try {
    const existingCache = await getSocialCache();
    const updatedCache = {
      ...existingCache,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    };
    await AsyncStorage.setItem(SOCIAL_CACHE_KEY, JSON.stringify(updatedCache));
    console.log(`✅ Social data cached: ${key}`);
  } catch (error) {
    console.error(`❌ Saving social cache failed for ${key}:`, error);
  }
};

export const getSocialCache = async (key?: string): Promise<any> => {
  try {
    const cacheData = await AsyncStorage.getItem(SOCIAL_CACHE_KEY);
    if (cacheData) {
      const parsed = JSON.parse(cacheData);

      if (key) {
        const item = parsed[key];
        if (item) {
          // Check if cache is older than 10 minutes
          const isExpired = Date.now() - item.timestamp > 10 * 60 * 1000;
          if (isExpired) {
            console.log(`⏰ Social cache expired for ${key}`);
            return null;
          }
          return item.data;
        }
        return null;
      }

      return parsed;
    }
    return key ? null : {};
  } catch (error) {
    console.error(`❌ Retrieving social cache failed for ${key}:`, error);
    return key ? null : {};
  }
};

export const clearSocialCache = async (key?: string) => {
  try {
    if (key) {
      const existingCache = await getSocialCache();
      delete existingCache[key];
      await AsyncStorage.setItem(
        SOCIAL_CACHE_KEY,
        JSON.stringify(existingCache)
      );
      console.log(`🗑️ Social cache cleared for ${key}`);
    } else {
      await AsyncStorage.removeItem(SOCIAL_CACHE_KEY);
      console.log("🗑️ All social cache cleared");
    }
  } catch (error) {
    console.error(`❌ Clearing social cache failed for ${key}:`, error);
  }
};

// User preferences
export const saveUserPreferences = async (preferences: any) => {
  try {
    const userData = await getUserData();
    if (userData) {
      const updatedData = {
        ...userData,
        preferences: {
          ...userData.preferences,
          ...preferences,
        },
      };
      await saveUserData(updatedData);
    }
  } catch (error) {
    console.error("❌ Saving user preferences failed:", error);
  }
};

export const getUserPreferences = async () => {
  try {
    const userData = await getUserData();
    return userData?.preferences || {};
  } catch (error) {
    console.error("❌ Retrieving user preferences failed:", error);
    return {};
  }
};

// Post interaction cache (likes, comments, etc.)
export const updatePostInteraction = async (
  postId: string,
  interaction: any
) => {
  try {
    const cacheKey = `post_${postId}`;
    const existingData = (await getSocialCache(cacheKey)) || {};

    const updatedData = {
      ...existingData,
      ...interaction,
      lastUpdated: Date.now(),
    };

    await saveSocialCache(updatedData, cacheKey);
  } catch (error) {
    console.error("❌ Updating post interaction failed:", error);
  }
};

export const getPostInteraction = async (postId: string) => {
  try {
    return await getSocialCache(`post_${postId}`);
  } catch (error) {
    console.error("❌ Getting post interaction failed:", error);
    return null;
  }
};

// Follow status cache
export const saveFollowStatus = async (
  userId: string,
  isFollowing: boolean
) => {
  try {
    const cacheKey = `follow_${userId}`;
    await saveSocialCache({ isFollowing }, cacheKey);
  } catch (error) {
    console.error("❌ Saving follow status failed:", error);
  }
};

export const getFollowStatus = async (
  userId: string
): Promise<boolean | null> => {
  try {
    const data = await getSocialCache(`follow_${userId}`);
    return data?.isFollowing ?? null;
  } catch (error) {
    console.error("❌ Getting follow status failed:", error);
    return null;
  }
};

// Analytics cache
export const saveAnalyticsData = async (data: any, type: string) => {
  try {
    const cacheKey = `analytics_${type}`;
    await saveSocialCache(data, cacheKey);
  } catch (error) {
    console.error("❌ Saving analytics data failed:", error);
  }
};

export const getAnalyticsData = async (type: string) => {
  try {
    return await getSocialCache(`analytics_${type}`);
  } catch (error) {
    console.error("❌ Getting analytics data failed:", error);
    return null;
  }
};

// Clear all cache
export const clearAllCache = async () => {
  try {
    await AsyncStorage.multiRemove([POSTS_CACHE_KEY, SOCIAL_CACHE_KEY]);
    console.log("🗑️ All cache cleared");
  } catch (error) {
    console.error("❌ Clearing all cache failed:", error);
  }
};

// Get cache info for debugging
export const getCacheInfo = async () => {
  try {
    const [postsCache, socialCache] = await Promise.all([
      AsyncStorage.getItem(POSTS_CACHE_KEY),
      AsyncStorage.getItem(SOCIAL_CACHE_KEY),
    ]);

    return {
      postsCache: postsCache ? JSON.parse(postsCache) : null,
      socialCache: socialCache ? JSON.parse(socialCache) : null,
      hasPosts: !!postsCache,
      hasSocial: !!socialCache,
    };
  } catch (error) {
    console.error("❌ Getting cache info failed:", error);
    return {
      postsCache: null,
      socialCache: null,
      hasPosts: false,
      hasSocial: false,
    };
  }
};

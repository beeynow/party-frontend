"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "./theme-context";
import type { ThemeContextType } from "./theme-context";
import { useToast } from "./ui/use-toast";
import {
  Upload,
  Image as ImageIcon,
  X,
  Tag,
  Grid3x3,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadPost } from "../lib/api";
import { getAuthToken } from "@/lib/auth-storage";

interface UploadedImage {
  uri: string;
  name: string;
  type: string;
}

const categories = [
  "general",
  "nature",
  "people",
  "technology",
  "art",
  "food",
  "travel",
  "sports",
  "business",
  "education",
  "other",
];

export default function AdminUploadScreen() {
  const [content, setContent] = useState(""); // ← This is your state variable
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const { colors } = useTheme();
  const { toast } = useToast();

  // Fixed sections for AdminUploadScreen.tsx

  // Method 1: Direct string approach (most compatible)
  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // Use string - most compatible
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          type: asset.type || "image/jpeg",
        }));

        // Check total limit
        if (selectedImages.length + newImages.length > 5) {
          toast({
            title: "Limit Reached",
            description: "You can only upload up to 5 images per post",
            variant: "destructive",
          });
          return;
        }

        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      toast({
        title: "Error",
        description: "Failed to pick images",
        variant: "destructive",
      });
    }
  };

  // TEST FUNCTION: Add this to your AdminUploadScreen.tsx for debugging
  const testSimpleUpload = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/images/test-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            test: "simple upload test",
            timestamp: new Date().toISOString(),
          }),
        }
      );

      const result = await response.json();
      console.log("🧪 Simple test result:", result);
      alert(
        `Simple test: ${result.success ? "SUCCESS" : "FAILED"} - ${
          result.message
        }`
      );
    } catch (error: any) {
      console.error("🧪 Simple test error:", error);
      alert("Simple test error: " + error.message);
    }
  };
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images", // Use string - most compatible
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]) {
        if (selectedImages.length >= 5) {
          toast({
            title: "Limit Reached",
            description: "You can only upload up to 5 images per post",
            variant: "destructive",
          });
          return;
        }

        const asset = result.assets[0];
        const newImage = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
        };

        setSelectedImages([...selectedImages, newImage]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast({
        title: "Error",
        description: "Failed to take photo",
        variant: "destructive",
      });
    }
  };

  // Alternative Method 2: Check what's available and use fallback
  const getMediaType = () => {
    // Try different possible property names/values
    if (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) {
      return ImagePicker.MediaTypeOptions.Images;
    }
    if (ImagePicker.MediaType && ImagePicker.MediaType.Images) {
      return ImagePicker.MediaType.Images;
    }
    // Fallback to string
    return "images";
  };

  // Alternative approach using the detection method
  const pickImagesAlternative = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const mediaType = getMediaType();
      console.log("Using mediaType:", mediaType);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
        aspect: [4, 3],
      });

      // ... rest of the function remains the same
    } catch (error) {
      console.error("Error picking images:", error);
      toast({
        title: "Error",
        description: "Failed to pick images",
        variant: "destructive",
      });
    }
  };

  // Debug function to check what's available in ImagePicker
  const debugImagePicker = () => {
    console.log("ImagePicker object keys:", Object.keys(ImagePicker));
    console.log("MediaTypeOptions:", ImagePicker.MediaTypeOptions);
    console.log("MediaType:", (ImagePicker as any).MediaType);

    // Check what properties exist
    if (ImagePicker.MediaTypeOptions) {
      console.log(
        "MediaTypeOptions keys:",
        Object.keys(ImagePicker.MediaTypeOptions)
      );
    }

    if ((ImagePicker as any).MediaType) {
      console.log(
        "MediaType keys:",
        Object.keys((ImagePicker as any).MediaType)
      );
    }
  };

  // 3. Fixed handleUpload function with better error handling and network testing
  const handleUpload = async () => {
    // Validation
    if (!content.trim() && selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please add some content or select at least one image",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Test network connectivity first
      console.log("🌐 Testing network connectivity...");
      const networkTest = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/health`
      );
      if (!networkTest.ok) {
        throw new Error("Network connectivity test failed");
      }
      console.log("✅ Network test passed");

      // Prepare tags array from the tags string
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      console.log("📤 Preparing upload data:", {
        content: content.trim(),
        category: selectedCategory,
        tagsCount: tagsArray.length,
        imagesCount: selectedImages.length,
      });

      // Log image details for debugging
      selectedImages.forEach((img, index) => {
        console.log(`📸 Image ${index + 1}:`, {
          name: img.name,
          type: img.type,
          uriStart: img.uri.substring(0, 30) + "...",
        });
      });

      const result = await uploadPost({
        content: content.trim(),
        category: selectedCategory,
        tags: tagsArray,
        images: selectedImages,
      });

      console.log("📤 Upload result:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Images uploaded successfully!",
          variant: "success",
        });

        // Reset form
        setContent("");
        setSelectedImages([]);
        setSelectedCategory("general");
        setTags("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload images",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Upload error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      let errorMessage = "Failed to upload images";

      if (error.message.includes("Network request failed")) {
        errorMessage =
          "Network connection failed. Check your internet connection and server status.";
      } else if (error.message.includes("timeout")) {
        errorMessage =
          "Upload timed out. Please try again with fewer or smaller images.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <ScrollView
      style={themedStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Post Content */}
      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>📝 Post Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="Description (optional)"
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            multiline
            numberOfLines={4}
            style={[themedStyles.input, themedStyles.textArea]}
          />
        </CardContent>
      </Card>

      {/* Category Selection */}
      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>
            🏷️ Category & Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TouchableOpacity
            style={themedStyles.categorySelector}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Grid3x3 color={colors.primary} size={20} />
            <Text style={themedStyles.categorySelectorText}>
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
            </Text>
          </TouchableOpacity>

          {showCategories && (
            <View style={themedStyles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    themedStyles.categoryOption,
                    selectedCategory === category &&
                      themedStyles.selectedCategory,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategories(false);
                  }}
                >
                  <Text
                    style={[
                      themedStyles.categoryText,
                      selectedCategory === category &&
                        themedStyles.selectedCategoryText,
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={themedStyles.inputContainer}>
            <Tag color={colors.textSecondary} size={16} />
            <Input
              value={tags}
              onChangeText={setTags}
              placeholder="Add tags (comma separated)"
              style={themedStyles.tagsInput}
            />
          </View>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>
            📷 Images ({selectedImages.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <View style={themedStyles.uploadButtons}>
            <TouchableOpacity
              style={[themedStyles.uploadButton, { flex: 1, marginRight: 8 }]}
              onPress={pickImages}
            >
              <ImageIcon color={colors.primary} size={24} />
              <Text style={themedStyles.uploadButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[themedStyles.uploadButton, { flex: 1, marginLeft: 8 }]}
              onPress={takePhoto}
            >
              <Upload color={colors.primary} size={24} />
              <Text style={themedStyles.uploadButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 && (
            <View style={themedStyles.imageGrid}>
              {selectedImages.map((image, index) => (
                <View key={index} style={themedStyles.imageContainer}>
                  <Image
                    source={{ uri: image.uri }}
                    style={themedStyles.image}
                  />
                  <TouchableOpacity
                    style={themedStyles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <X color={colors.white} size={16} />
                  </TouchableOpacity>
                  <View style={themedStyles.imageIndex}>
                    <Text style={themedStyles.imageIndexText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {selectedImages.length > 0 && (
            <View style={themedStyles.imageInfo}>
              <Text style={themedStyles.imageInfoText}>
                ✅ {selectedImages.length} image
                {selectedImages.length > 1 ? "s" : ""} selected
              </Text>
              <Text style={themedStyles.imageInfoSubtext}>
                Images will be automatically optimized and compressed
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      {/* Upload Button */}
      <View style={themedStyles.actionContainer}>
        <Button
          onPress={handleUpload}
          loading={uploading}
          disabled={selectedImages.length === 0}
          //@ts-ignore
          style={[
            themedStyles.uploadPostButton,
            selectedImages.length === 0 && themedStyles.disabledButton,
          ]}
        >
          <View style={themedStyles.uploadButtonContent}>
            <Upload color={colors.white} size={20} />
            <Text style={themedStyles.uploadPostButtonText}>
              {uploading
                ? `Uploading ${selectedImages.length} image${
                    selectedImages.length > 1 ? "s" : ""
                  }...`
                : "Upload Post"}
            </Text>
          </View>
        </Button>

        {uploading && (
          <View style={themedStyles.uploadingInfo}>
            <Text style={themedStyles.uploadingText}>
              📤 Processing and optimizing your images...
            </Text>
          </View>
        )}
      </View>

      {/* Tips */}
      <Card style={themedStyles.tipsCard}>
        <CardContent style={themedStyles.tipsContent}>
          <Text style={themedStyles.tipsTitle}>💡 Upload Tips</Text>
          <Text style={themedStyles.tipsText}>
            • Images are automatically resized and optimized{"\n"}• Maximum 5
            images per post{"\n"}• Supported formats: JPG, PNG, WebP, GIF{"\n"}•
            Maximum file size: 5MB per image{"\n"}• Add relevant tags to improve
            discoverability
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      margin: 16,
      marginBottom: 8,
      backgroundColor: colors.cardBackground,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    input: {
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    categorySelector: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    categorySelectorText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 12,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    categoryOption: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    selectedCategory: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    selectedCategoryText: {
      color: colors.white,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    tagsInput: {
      flex: 1,
      marginLeft: 8,
      marginBottom: 0,
    },
    uploadButtons: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 16,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 20,
      gap: 12,
    },
    uploadButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 16,
    },
    imageContainer: {
      position: "relative",
      width: 100,
      height: 100,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
    },
    removeButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: colors.red,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    imageIndex: {
      position: "absolute",
      bottom: 4,
      left: 4,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 8,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    imageIndexText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "600",
    },
    imageInfo: {
      backgroundColor: colors.primary + "20",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    imageInfoText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 4,
    },
    imageInfoSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    actionContainer: {
      padding: 16,
    },
    uploadPostButton: {
      paddingVertical: 16,
      backgroundColor: colors.primary,
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
    uploadButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    uploadPostButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.white,
    },
    uploadingInfo: {
      alignItems: "center",
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.primary + "20",
      borderRadius: 12,
    },
    uploadingText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
      textAlign: "center",
    },
    tipsCard: {
      margin: 16,
      marginTop: 8,
      marginBottom: 32,
      backgroundColor: colors.cardBackground,
    },
    tipsContent: {
      padding: 16,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    tipsText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

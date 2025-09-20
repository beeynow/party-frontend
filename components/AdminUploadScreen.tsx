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
import { Upload, Image as ImageIcon, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadPost } from "../lib/api";

interface UploadedImage {
  uri: string;
  name: string;
  type: string;
}

export default function AdminUploadScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
        }));
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

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
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
      const result = await uploadPost({
        title: title.trim(),
        description: description.trim(),
        images: selectedImages,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Post uploaded successfully!",
          variant: "success",
        });

        // Reset form
        setTitle("");
        setDescription("");
        setSelectedImages([]);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload post",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload post",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const themedStyles = getThemedStyles(colors);

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Upload color={colors.primary} size={32} />
        <Text style={themedStyles.headerTitle}>UPLOAD POST</Text>
        <Text style={themedStyles.headerSubtitle}>
          Create and share new content
        </Text>
      </View>

      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title..."
            style={themedStyles.input}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter post description..."
            multiline
            numberOfLines={4}
            style={[themedStyles.input, themedStyles.textArea]}
          />
        </CardContent>
      </Card>

      <Card style={themedStyles.card}>
        <CardHeader>
          <CardTitle style={themedStyles.cardTitle}>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <TouchableOpacity
            style={themedStyles.uploadButton}
            onPress={pickImages}
          >
            <ImageIcon color={colors.primary} size={24} />
            <Text style={themedStyles.uploadButtonText}>Select Images</Text>
          </TouchableOpacity>

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
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>

      <View style={themedStyles.actionContainer}>
        <Button
          onPress={handleUpload}
          loading={uploading}
          disabled={!title.trim() || selectedImages.length === 0}
          style={themedStyles.uploadPostButton}
        >
          {uploading ? "Uploading..." : "Upload Post"}
        </Button>
      </View>
    </ScrollView>
  );
}

const getThemedStyles = (colors: ThemeContextType["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.textPrimary,
      letterSpacing: 1,
      marginTop: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
      marginTop: 4,
    },
    card: {
      margin: 20,
      marginTop: 12,
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
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
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
      marginTop: 16,
    },
    imageContainer: {
      position: "relative",
      width: 100,
      height: 100,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
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
    },
    actionContainer: {
      padding: 20,
    },
    uploadPostButton: {
      paddingVertical: 16,
    },
  });

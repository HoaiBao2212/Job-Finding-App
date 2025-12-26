import { colors, Fonts } from "@/constants/theme";
import { uploadToCloudinary } from "@/lib/services/cloudinaryService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface CandidateAvatarUploadProps {
  userId: string;
  initialAvatarUrl?: string;
  onAvatarUploadSuccess?: (avatarUrl: string) => void;
}

export default function CandidateAvatarUpload({
  userId,
  initialAvatarUrl,
  onAvatarUploadSuccess,
}: CandidateAvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    initialAvatarUrl
  );
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialAvatarUrl
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Xử lý khi người dùng chọn file ảnh
   */
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage(
        "Invalid file type. Please upload JPG, PNG, or WebP image."
      );
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Upload to Cloudinary
    await uploadFile(selectedFile);
  };

  /**
   * Upload file to Cloudinary only
   * Database save will be handled by parent component
   */
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Upload to Cloudinary
      const uploadedUrl = await uploadToCloudinary(file);
      setAvatarUrl(uploadedUrl);

      setSuccessMessage("Avatar ready to save. Click 'Lưu thay đổi' to save.");

      // Callback to parent component with the URL
      if (onAvatarUploadSuccess) {
        onAvatarUploadSuccess(uploadedUrl);
      }

      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to upload avatar";
      setErrorMessage(errorMsg);
      console.error("Avatar upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Pick image from device
   */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];

      // Convert to File object
      const response = await fetch(selectedAsset.uri);
      const blob = await response.blob();
      const filename = selectedAsset.uri.split("/").pop() || "avatar.jpg";
      const file = new File([blob], filename, { type: blob.type });

      await handleFileChange(file);
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];

      // Convert to File object
      const response = await fetch(selectedAsset.uri);
      const blob = await response.blob();
      const filename = selectedAsset.uri.split("/").pop() || "avatar.jpg";
      const file = new File([blob], filename, { type: blob.type });

      await handleFileChange(file);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Avatar</Text>

      {/* Avatar Preview */}
      <View style={styles.previewContainer}>
        {previewUrl || avatarUrl ? (
          <Image
            source={{ uri: previewUrl || avatarUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color={colors.textGray}
            />
            <Text style={styles.placeholderText}>No avatar yet</Text>
          </View>
        )}
      </View>

      {/* Upload Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={pickImage}
          disabled={isUploading}
        >
          <MaterialCommunityIcons name="image-plus" size={20} color="white" />
          <Text style={styles.buttonText}>Choose Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={takePhoto}
          disabled={isUploading}
        >
          <MaterialCommunityIcons name="camera" size={20} color="white" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Supported Formats Info */}
      <Text style={styles.infoText}>
        Supported formats: JPG, PNG, WebP • Max size: 5MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 12,
    fontFamily: Fonts.sans,
  },
  previewContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    backgroundColor: colors.primarySoftBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignSelf: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textGray,
    fontFamily: Fonts.sans,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#EBF5FF",
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontFamily: Fonts.sans,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4CAF50",
    fontFamily: Fonts.sans,
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#F44336",
    fontFamily: Fonts.sans,
    flex: 1,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: "#6C757D",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  infoText: {
    fontSize: 12,
    color: colors.textGray,
    fontFamily: Fonts.sans,
    marginTop: 8,
  },
});

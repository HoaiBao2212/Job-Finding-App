import { colors, Fonts } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface EmployerLogoUploadProps {
  initialLogoUrl?: string;
  selectedImageUri?: string;
  onImageSelected?: (uri: string, file: File) => void;
}

export default function EmployerLogoUpload({
  initialLogoUrl,
  selectedImageUri,
  onImageSelected,
}: EmployerLogoUploadProps) {
  const [logoUrl] = useState<string | undefined>(initialLogoUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Xử lý khi người dùng chọn file ảnh
   * Chỉ lưu URI, không upload ngay lập tức
   */
  const handleFileChange = async (selectedFile: File, uri: string) => {
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

    setErrorMessage(null);

    // Callback to parent component with the file and URI
    if (onImageSelected) {
      onImageSelected(uri, selectedFile);
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
      const filename = selectedAsset.uri.split("/").pop() || "logo.jpg";
      const file = new File([blob], filename, { type: blob.type });

      await handleFileChange(file, selectedAsset.uri);
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
      const filename = selectedAsset.uri.split("/").pop() || "logo.jpg";
      const file = new File([blob], filename, { type: blob.type });

      await handleFileChange(file, selectedAsset.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Logo công ty</Text>

      {/* Logo Preview - Centered */}
      <View style={styles.previewContainerWrapper}>
        <View style={styles.previewContainer}>
          {selectedImageUri || logoUrl ? (
            <Image
              source={{ uri: selectedImageUri || logoUrl }}
              style={styles.logoImage}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialCommunityIcons
                name="image-plus"
                size={60}
                color={colors.textGray}
              />
              <Text style={styles.placeholderText}>Chưa có logo</Text>
            </View>
          )}
        </View>
      </View>

      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorMessage}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color="#F44336"
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Upload Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={pickImage}
        >
          <MaterialCommunityIcons name="image-plus" size={20} color="white" />
          <Text style={styles.buttonText}>Chọn ảnh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={takePhoto}
        >
          <MaterialCommunityIcons name="camera" size={20} color="white" />
          <Text style={styles.buttonText}>Chụp ảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Supported Formats Info */}
      <Text style={styles.infoText}>
        Định dạng: JPG, PNG, WebP • Tối đa: 5MB
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
  previewContainerWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewContainer: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.primarySoftBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  logoImage: {
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

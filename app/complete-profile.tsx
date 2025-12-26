import AlertModal from "@/app/Component/AlertModal";
import { useAlert } from "@/app/Component/useAlert.hook";
import { Fonts, theme } from "@/constants/theme";
import { uploadToCloudinary } from "@/lib/services/cloudinaryService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VIETNAM_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
];

export default function CompleteProfileScreen() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [role, setRole] = useState<"candidate" | "employer" | "">("");
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { alertState, showAlert, hideAlert } = useAlert();

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showAlert("Lỗi", "Không thể chọn ảnh");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          showAlert("Thông báo", "Phiên đăng nhập đã hết hạn.");
          router.replace("/(auth)/login");
          return;
        }

        setEmail(user.email ?? "");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 = no rows found
          throw profileError;
        }

        if (profile) {
          setFullName(profile.full_name ?? "");
          setPhone(profile.phone ?? "");
          setAvatarUrl(profile.avatar_url ?? "");
          setRole(profile.role ?? "");
          setLocation(profile.location ?? "");
        }
      } catch (err: any) {
        console.error(err);
        showAlert(
          "Lỗi",
          err?.message || "Không tải được thông tin hồ sơ, vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName || !location || !role) {
      showAlert(
        "Thiếu thông tin",
        "Vui lòng nhập họ tên, chọn vai trò và tỉnh/thành phố."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        showAlert("Thông báo", "Phiên đăng nhập đã hết hạn.");
        router.replace("/(auth)/login");
        return;
      }

      // Upload image to Cloudinary if a new image was selected
      let finalAvatarUrl = avatarUrl;
      if (selectedImageUri) {
        try {
          // Convert URI to File object for Cloudinary upload
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          const filename = selectedImageUri.split("/").pop() || "avatar.jpg";
          const file = new File([blob], filename, { type: "image/jpeg" });

          finalAvatarUrl = await uploadToCloudinary(file);
        } catch (error) {
          console.error("Error uploading image:", error);
          showAlert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
          return;
        }
      }

      // Cập nhập profiles table
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          email: user.email,
          phone,
          avatar_url: finalAvatarUrl,
          role,
          location,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;

      showAlert("Thành công", "Đã lưu thông tin hồ sơ của bạn.", [
        {
          text: "OK",
          style: "default",
          onPress: () => {
            // Điều hướng dựa trên role
            if (role === "employer") {
              router.replace("/Employer/Dashboard");
            } else if (role === "candidate") {
              router.replace("/Candidate/JobFinding");
            }
          },
        },
      ]);
    } catch (err: any) {
      console.error(err);
      showAlert("Lỗi", err?.message || "Không thể lưu thông tin, thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hoàn thiện hồ sơ</Text>
          <Text style={styles.subtitle}>
            Vui lòng cập nhật thông tin cá nhân để trải nghiệm ứng dụng tốt hơn.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Email (read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{email}</Text>
            </View>
          </View>

          {/* Họ tên */}
          <View style={styles.field}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên đầy đủ"
              placeholderTextColor={theme.colors.textGray}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Số điện thoại */}
          <View style={styles.field}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0987 654 321"
              placeholderTextColor={theme.colors.textGray}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Avatar */}
          <View style={styles.field}>
            <Text style={styles.label}>Ảnh đại diện</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.borderLight,
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                {selectedImageUri ? (
                  <Image
                    source={{ uri: selectedImageUri }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account"
                    size={40}
                    color={theme.colors.textGray}
                  />
                )}
              </View>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primarySoftBg,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
                onPress={handlePickImage}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.primary,
                    fontFamily: Fonts.sans,
                  }}
                >
                  Chọn ảnh
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vai trò */}
          <View style={styles.field}>
            <Text style={styles.label}>Vai trò</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleChip,
                  role === "candidate" && styles.roleChipActive,
                ]}
                onPress={() => setRole("candidate")}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === "candidate" && styles.roleChipTextActive,
                  ]}
                >
                  Người tìm việc
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleChip,
                  role === "employer" && styles.roleChipActive,
                ]}
                onPress={() => setRole("employer")}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === "employer" && styles.roleChipTextActive,
                  ]}
                >
                  Nhà tuyển dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Địa điểm (34 tỉnh/thành) */}
          <View style={styles.field}>
            <Text style={styles.label}>Tỉnh / Thành phố</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={location}
                onValueChange={(value) => setLocation(value)}
              >
                <Picker.Item label="Chọn tỉnh / thành phố" value="" />
                {VIETNAM_LOCATIONS.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Nút lưu */}
          <TouchableOpacity
            style={[styles.primaryButton, saving && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Lưu thông tin</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.soft,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text.heading,
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.subtle,
    fontFamily: Fonts.sans,
  },
  card: {
    backgroundColor: theme.background.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginBottom: 6,
    fontFamily: Fonts.sans,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.bgNeutral,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textDark,
    fontFamily: Fonts.sans,
  },
  inputDisabled: {
    backgroundColor: "#E9ECEF",
    borderColor: "#CED4DA",
  },
  inputDisabledText: {
    fontSize: 14,
    color: theme.colors.textGray,
    fontFamily: Fonts.sans,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
  },
  roleChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingVertical: 8,
    alignItems: "center",
  },
  roleChipActive: {
    backgroundColor: theme.colors.primarySoftBg,
    borderColor: theme.colors.primary,
  },
  roleChipText: {
    fontSize: 13,
    color: theme.colors.textDark,
    fontFamily: Fonts.sans,
  },
  roleChipTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: "600",
  },
  pickerWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.bgNeutral,
    overflow: "hidden",
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: theme.button.primary.bg,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.button.primary.text,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: theme.text.subtle,
    fontFamily: Fonts.sans,
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { companyService } from "../../lib/services/companyService";
import { employerService } from "../../lib/services/employerService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert.hook";

interface CompanyEditFormData {
  name: string;
  description: string;
  website: string;
  location: string;
  industry: string;
}

export default function CompanyEditingScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompanyEditFormData>({
    name: "",
    description: "",
    website: "",
    location: "",
    industry: "",
  });

  const { alertState, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Lấy employer profile để tìm company_id
      const employer = await employerService.getEmployerProfile(user.id);
      if (employer?.company_id) {
        setCompanyId(employer.company_id);
        // Lấy thông tin công ty
        const companyData = await companyService.getCompanyById(
          employer.company_id
        );
        if (companyData) {
          setFormData({
            name: companyData.name || "",
            description: companyData.description || "",
            website: companyData.website || "",
            location: companyData.location || "",
            industry: companyData.industry || "",
          });
        }
      } else {
        showAlert(
          "Thông báo",
          "Bạn chưa liên kết công ty. Vui lòng tạo hồ sơ công ty trước."
        );
      }
    } catch (error) {
      console.error("Error loading company data:", error);
      showAlert("Lỗi", "Không thể tải thông tin công ty");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!companyId) {
      showAlert("Lỗi", "Không tìm thấy ID công ty");
      return;
    }

    if (!formData.name.trim()) {
      showAlert("Cảnh báo", "Tên công ty không được để trống");
      return;
    }

    if (!formData.location.trim()) {
      showAlert("Cảnh báo", "Địa điểm không được để trống");
      return;
    }

    try {
      setSaving(true);
      await companyService.updateCompany(companyId, formData);
      showAlert("Thành công", "Cập nhật thông tin công ty thành công", [
        {
          text: "OK",
          onPress: () => {
            hideAlert();
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating company:", error);
      showAlert("Lỗi", "Không thể cập nhật thông tin công ty");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textGray }}>
              Đang tải thông tin...
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 35,
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.white,
                  }}
                >
                  Chỉnh sửa công ty
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            {/* Tên công ty */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textGray,
                  marginBottom: 8,
                }}
              >
                Tên công ty *
              </Text>
              <TextInput
                placeholder="Nhập tên công ty"
                placeholderTextColor={colors.textGray}
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
              />
            </View>

            {/* Mô tả */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textGray,
                  marginBottom: 8,
                }}
              >
                Mô tả công ty
              </Text>
              <TextInput
                placeholder="Nhập mô tả công ty..."
                placeholderTextColor={colors.textGray}
                value={formData.description}
                onChangeText={(value) =>
                  setFormData({ ...formData, description: value })
                }
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Ngành công nghiệp */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textGray,
                  marginBottom: 8,
                }}
              >
                Ngành công nghiệp
              </Text>
              <TextInput
                placeholder="VD: Công nghệ, Tài chính, Bán lẻ..."
                placeholderTextColor={colors.textGray}
                value={formData.industry}
                onChangeText={(value) =>
                  setFormData({ ...formData, industry: value })
                }
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
              />
            </View>

            {/* Địa chỉ */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textGray,
                  marginBottom: 8,
                }}
              >
                Địa chỉ *
              </Text>
              <TextInput
                placeholder="Nhập địa chỉ công ty"
                placeholderTextColor={colors.textGray}
                value={formData.location}
                onChangeText={(value) =>
                  setFormData({ ...formData, location: value })
                }
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Website */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.textGray,
                  marginBottom: 8,
                }}
              >
                Website
              </Text>
              <TextInput
                placeholder="VD: https://example.com"
                placeholderTextColor={colors.textGray}
                value={formData.website}
                onChangeText={(value) =>
                  setFormData({ ...formData, website: value })
                }
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
              />
            </View>

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={saving}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  backgroundColor: colors.white,
                  alignItems: "center",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textDark,
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateCompany}
                disabled={saving}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.white,
                    }}
                  >
                    Lưu thay đổi
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <AlertModal
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onDismiss={() => {}}
        />
      </SafeAreaView>
    </EmployerSidebarLayout>
  );
}

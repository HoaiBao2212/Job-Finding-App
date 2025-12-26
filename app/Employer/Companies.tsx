import { colors, Fonts } from "@/constants/theme";
import { authService } from "@/lib/services/authService";
import { uploadToCloudinary } from "@/lib/services/cloudinaryService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AlertModal from "../Component/AlertModal";
import EmployerLogoUpload from "../Component/EmployerLogoUpload";
import { useAlert } from "../Component/useAlert.hook";

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

const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const INDUSTRIES = [
  "Công nghệ",
  "Tài chính",
  "Y tế",
  "Giáo dục",
  "Bán lẻ",
  "Sản xuất",
  "Xây dựng",
  "Du lịch",
  "Vận tải",
  "Truyền thông",
  "Khác",
];

export default function CompaniesScreen() {
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Company info
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>();
  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>();

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Check if employer exists
      const { data: employer } = await supabase
        .from("employers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (employer?.company_id) {
        // Load existing company data
        const { data: company } = await supabase
          .from("companies")
          .select("*")
          .eq("id", employer.company_id)
          .single();

        if (company) {
          setCompanyName(company.name || "");
          setCompanyDescription(company.description || "");
          setCompanySize(company.company_size || "");
          setIndustry(company.industry || "");
          setWebsite(company.website || "");
          setLogoUrl(company.logo_url || "");
        }
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyName || !companySize || !industry) {
      showAlert(
        "Thiếu thông tin",
        "Vui lòng nhập tên công ty, quy mô và ngành nghề."
      );
      return;
    }

    try {
      setSaving(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Upload image to Cloudinary if selected
      let finalLogoUrl = logoUrl;
      if (selectedImageFile) {
        try {
          finalLogoUrl = await uploadToCloudinary(selectedImageFile);
        } catch (error) {
          console.error("Error uploading logo:", error);
          showAlert("Lỗi", "Không thể upload logo. Vui lòng thử lại.");
          return;
        }
      }

      // Check if employer exists
      const { data: existingEmployer } = await supabase
        .from("employers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      let companyId: number;

      if (existingEmployer?.company_id) {
        // Update existing company
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            name: companyName,
            description: companyDescription,
            company_size: companySize,
            industry: industry,
            website: website || null,
            logo_url: finalLogoUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingEmployer.company_id);

        if (updateError) throw updateError;
        companyId = existingEmployer.company_id;
      } else {
        // Create new company
        const { data: newCompany, error: createError } = await supabase
          .from("companies")
          .insert({
            name: companyName,
            description: companyDescription,
            company_size: companySize,
            industry: industry,
            website: website || null,
            logo_url: finalLogoUrl || null,
          })
          .select()
          .single();

        if (createError) throw createError;
        companyId = newCompany.id;

        // Create employer record if it doesn't exist
        if (!existingEmployer) {
          const { error: employerError } = await supabase
            .from("employers")
            .insert({
              user_id: user.id,
              company_id: companyId,
            });

          if (employerError) throw employerError;
        }
      }

      showAlert("Thành công", "Đã lưu thông tin công ty.", [
        {
          text: "OK",
          style: "default",
          onPress: () => {
            hideAlert();
            router.replace("/Employer/JobApplication");
          },
        },
      ]);
    } catch (err: any) {
      console.error(err);
      showAlert("Lỗi", err?.message || "Không thể lưu thông tin công ty.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Thông tin công ty</Text>
            <Text style={styles.headerSubtitle}>
              Cập nhật thông tin công ty để bắt đầu đăng tin tuyển dụng
            </Text>
          </View>
        </View>

        {/* Company Logo Section */}
        <EmployerLogoUpload
          initialLogoUrl={logoUrl}
          selectedImageUri={selectedImageUri}
          onImageSelected={(uri, file) => {
            setSelectedImageUri(uri);
            setSelectedImageFile(file);
          }}
        />

        {/* Company Basic Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Tên công ty *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên công ty"
              placeholderTextColor={colors.textGray}
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mô tả công ty</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập mô tả về công ty..."
              placeholderTextColor={colors.textGray}
              value={companyDescription}
              onChangeText={setCompanyDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Quy mô công ty *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={companySize}
                  onValueChange={(value) => setCompanySize(value)}
                >
                  <Picker.Item label="Chọn quy mô" value="" />
                  {SIZES.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ngành nghề *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={industry}
                onValueChange={(value) => setIndustry(value)}
              >
                <Picker.Item label="Chọn ngành nghề" value="" />
                {INDUSTRIES.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Contact Info - Website only, email/phone from profile */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              placeholderTextColor={colors.textGray}
              value={website}
              onChangeText={setWebsite}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>Lưu thông tin</Text>
              </>
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
    backgroundColor: colors.bgNeutral,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textGray,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.textDark,
    fontFamily: Fonts.sans,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textGray,
    fontFamily: Fonts.sans,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.textDark,
    fontFamily: Fonts.sans,
    marginBottom: 16,
  },
  logoContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed" as const,
    borderColor: colors.borderLight,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    backgroundColor: "rgba(99, 102, 241, 0.03)",
    overflow: "hidden" as const,
  },
  logoPlaceholderText: {
    fontSize: 12,
    color: colors.textGray,
    fontFamily: Fonts.sans,
    textAlign: "center" as const,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textDark,
    fontFamily: Fonts.sans,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgNeutral,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
    fontFamily: Fonts.sans,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row" as const,
    marginBottom: 0,
  },
  pickerWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgNeutral,
    overflow: "hidden" as const,
  },
  buttonContainer: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 40,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textDark,
    fontFamily: Fonts.sans,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
    fontFamily: Fonts.sans,
  },
  hiddenFileInput: {
    display: "none" as const,
  },
});

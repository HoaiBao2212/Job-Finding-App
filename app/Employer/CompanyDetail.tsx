import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../constants/theme";
import { companyService } from "../../lib/services/companyService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert";

interface CompanyDetailInfo {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  location?: string;
  industry?: string;
  created_at?: string;
  updated_at?: string;
}

export default function CompanyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const companyId = params.companyId
    ? parseInt(params.companyId as string)
    : null;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetailInfo | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const { alertState, showAlert } = useAlert();

  useEffect(() => {
    if (companyId && !isNaN(companyId)) {
      loadCompanyDetail();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const loadCompanyDetail = async () => {
    try {
      setLoading(true);
      const companyData = await companyService.getCompanyById(companyId!);
      setCompany(companyData);

      // Lấy số lượng công việc của công ty này
      try {
        // Truy vấn để đếm số jobs cho công ty này
        const jobsResponse = await (
          await import("../../lib/supabase")
        ).supabase
          .from("jobs")
          .select("id")
          .eq("company_id", companyId!);

        if (jobsResponse.data) {
          setJobCount(jobsResponse.data.length);
        }
      } catch (error) {
        console.error("Error loading job count:", error);
        setJobCount(0);
      }
    } catch (error) {
      console.error("Error loading company detail:", error);
      showAlert("Lỗi", `Không thể tải chi tiết công ty: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
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
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  if (!company) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <MaterialCommunityIcons
              name="briefcase-search"
              size={48}
              color={colors.textGray}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.textDark,
              }}
            >
              Công ty không tồn tại
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginTop: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: colors.primary,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Quay lại
              </Text>
            </TouchableOpacity>
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
              paddingTop: 16,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
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
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: colors.white,
                  flex: 1,
                  marginLeft: 12,
                }}
                numberOfLines={2}
              >
                {company.name}
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/Employer/CompanyEditing?companyId=${company.id}`)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Company Logo và Info Section */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            {/* Logo hoặc Icon */}
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              {company.logo_url ? (
                <MaterialCommunityIcons
                  name="image"
                  size={64}
                  color={colors.primary}
                />
              ) : (
                <MaterialCommunityIcons
                  name="office-building"
                  size={64}
                  color={colors.primary}
                />
              )}
            </View>

            {/* Company Stats */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 20,
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="briefcase"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 8,
                  }}
                >
                  {jobCount}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 4,
                  }}
                >
                  Công việc
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.textDark,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  {new Date(company.created_at || "").getFullYear() || "N/A"}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 4,
                  }}
                >
                  Năm thành lập
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.textDark,
                    marginTop: 8,
                  }}
                >
                  {company.location
                    ? company.location.split(",")[0]
                    : "Không xác định"}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 4,
                  }}
                >
                  Địa điểm
                </Text>
              </View>
            </View>

            {/* Info Sections */}
            {company.description && (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginBottom: 12,
                  }}
                >
                  Mô tả
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textGray,
                    lineHeight: 20,
                  }}
                >
                  {company.description}
                </Text>
              </View>
            )}

            {/* Industry */}
            {company.industry && (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 8,
                    }}
                  >
                    Ngành công nghiệp
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textDark,
                    }}
                  >
                    {company.industry}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="factory"
                  size={24}
                  color={colors.primary}
                />
              </View>
            )}

            {/* Website */}
            {company.website && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 8,
                    }}
                  >
                    Website
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                    numberOfLines={1}
                  >
                    {company.website}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}

            {/* Location */}
            {company.location && (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 8,
                    }}
                  >
                    Địa chỉ
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textDark,
                    }}
                    numberOfLines={2}
                  >
                    {company.location}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={colors.primary}
                />
              </View>
            )}

            {/* Updated Date */}
            <View
              style={{
                backgroundColor: colors.primarySoftBg,
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                }}
              >
                Cập nhật lần cuối
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                {formatDate(company.updated_at)}
              </Text>
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

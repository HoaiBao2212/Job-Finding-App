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
import { jobService } from "../../lib/services/jobService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert";

interface JobDetail {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  view_count: number;
  deadline: string;
  is_active: boolean;
  companies?: {
    name: string;
    industry?: string;
    size?: string;
    logo_url?: string;
  };
}

export default function EmployerJobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobDetail | null>(null);
  const { alertState, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    if (jobId) {
      loadJobDetail();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(jobId!);
      setJob(jobData);
    } catch (error) {
      console.error("Error loading job detail:", error);
      showAlert("Lỗi", "Không thể tải chi tiết công việc");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      }
      return num.toLocaleString("vi-VN");
    };
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
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
            <Text style={{ marginTop: 12, color: colors.textGray }}>
              Đang tải thông tin công việc...
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  if (!jobId) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color={colors.textGray}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.textDark,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Không có ID công việc
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  if (!job) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color={colors.textGray}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.textDark,
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Không tìm thấy công việc
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: 12 }}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={colors.white}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.white,
                marginBottom: 8,
              }}
            >
              {job.title}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name="briefcase"
                size={16}
                color={colors.white}
              />
              <Text
                style={{ fontSize: 14, color: colors.white, marginLeft: 8 }}
              >
                {job.companies?.name || "Công ty"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="eye"
                size={16}
                color={colors.white}
              />
              <Text
                style={{ fontSize: 12, color: colors.white, marginLeft: 8 }}
              >
                {job.view_count} lượt xem
              </Text>
            </View>
          </View>

          {/* Job Info Cards */}
          <View style={{ padding: 16 }}>
            {/* Status & Active Badge */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: job.is_active ? "#E8F5E9" : "#FFEBEE",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name={job.is_active ? "check-circle" : "close-circle"}
                  size={18}
                  color={job.is_active ? "#2E7D32" : "#C62828"}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: job.is_active ? "#2E7D32" : "#C62828",
                    marginLeft: 8,
                  }}
                >
                  {job.is_active ? "Đang tuyển" : "Đóng"}
                </Text>
              </View>
            </View>

            {/* Quick Info Grid */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 12,
                }}
              >
                Thông tin cơ bản
              </Text>

              <View style={{ gap: 12 }}>
                {/* Salary */}
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.primarySoftBg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="currency-usd"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginBottom: 2,
                      }}
                    >
                      Lương
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                      }}
                    >
                      {formatSalary(
                        job.salary_min || 0,
                        job.salary_max || 0,
                        job.salary_currency
                      )}
                    </Text>
                  </View>
                </View>

                {/* Location */}
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.primarySoftBg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginBottom: 2,
                      }}
                    >
                      Địa điểm
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                      }}
                    >
                      {job.location}
                    </Text>
                  </View>
                </View>

                {/* Job Type */}
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.primarySoftBg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginBottom: 2,
                      }}
                    >
                      Loại công việc
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                      }}
                    >
                      {job.job_type}
                    </Text>
                  </View>
                </View>

                {/* Experience Level */}
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.primarySoftBg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginBottom: 2,
                      }}
                    >
                      Cấp độ kinh nghiệm
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                      }}
                    >
                      {job.experience_level}
                    </Text>
                  </View>
                </View>

                {/* Deadline */}
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.primarySoftBg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginBottom: 2,
                      }}
                    >
                      Hạn chót ứng tuyển
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                      }}
                    >
                      {formatDate(job.deadline)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 12,
                }}
              >
                Mô tả công việc
              </Text>
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textDark,
                    lineHeight: 22,
                  }}
                >
                  {job.description}
                </Text>
              </View>
            </View>

            {/* Requirements */}
            {job.requirements && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textDark,
                    marginBottom: 12,
                  }}
                >
                  Yêu cầu công việc
                </Text>
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textDark,
                      lineHeight: 22,
                    }}
                  >
                    {job.requirements}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.primary,
                    marginTop: 4,
                  }}
                >
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={20}
                  color={colors.white}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.white,
                    marginTop: 4,
                  }}
                >
                  Xem ứng viên
                </Text>
              </TouchableOpacity>
            </View>
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
    </EmployerSidebarLayout>
  );
}

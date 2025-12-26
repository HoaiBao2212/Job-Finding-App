import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { supabase } from "../../lib/supabase";
import SidebarLayout from "../Component/SidebarLayout";

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

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<JobDetail | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [candidateProfile, setCandidateProfile] = React.useState<any>(null);
  const [applying, setApplying] = React.useState(false);
  const [applicationStatus, setApplicationStatus] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    console.log("JobDetail params:", params);
    console.log("JobDetail jobId:", jobId);
    if (jobId) {
      loadJobDetail();
      checkApplicationStatus();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const checkApplicationStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      // Get candidate profile
      const { data: candidateData } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (candidateData && jobId) {
        // Check application status
        const { data: appData } = await supabase
          .from("job_applications")
          .select("status")
          .eq("job_id", jobId)
          .eq("candidate_id", candidateData.id)
          .single();

        if (appData) {
          setApplicationStatus(appData.status);
          console.log("Application status:", appData.status);
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Load candidate profile
      const { data: candidateData } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (candidateData) {
        setCandidateProfile(candidateData);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleApplyModal = async () => {
    await loadUserProfile();
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!job || !candidateProfile) {
      Alert.alert("Lỗi", "Không thể tạo đơn ứng tuyển");
      return;
    }

    try {
      setApplying(true);

      // Create job application
      const { error } = await supabase.from("job_applications").insert([
        {
          job_id: job.id,
          candidate_id: candidateProfile.id,
          status: "pending",
          interview_id: null,
        },
      ]);

      if (error) throw error;

      // Reload application status from database
      await checkApplicationStatus();
      setShowApplyModal(false);
      Alert.alert("Thành công", "Đơn ứng tuyển đã được gửi!", [
        {
          text: "OK",
          onPress: () => {},
        },
      ]);
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert("Lỗi", "Không thể gửi đơn ứng tuyển");
    } finally {
      setApplying(false);
    }
  };

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      console.log("Loading job with ID:", jobId);
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          description,
          requirements,
          location,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          salary_currency,
          view_count,
          deadline,
          is_active,
          companies(name, industry, company_size, logo_url)
        `
        )
        .eq("id", jobId)
        .single();

      console.log("Query error:", error);
      console.log("Query data:", data);

      if (error) throw error;

      if (data) {
        const companyData = Array.isArray(data.companies)
          ? data.companies[0]
          : data.companies;

        setJob({
          ...data,
          companies: companyData
            ? {
                name: companyData.name,
                industry: companyData.industry,
                size: companyData.company_size,
                logo_url: companyData.logo_url,
              }
            : undefined,
        });

        // Increment view count
        await incrementViewCount(jobId);
      }
    } catch (error) {
      console.error("Error loading job detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết công việc");
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (id: number | null) => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ view_count: (job?.view_count || 0) + 1 })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error incrementing view count:", error);
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

  const formatJobType = (jobType?: string) => {
    const typeMap: { [key: string]: string } = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      internship: "Thực tập",
      remote: "Remote",
      hybrid: "Hybrid",
    };
    return typeMap[jobType || ""] || jobType || "Không xác định";
  };

  const formatExperienceLevel = (level?: string) => {
    const levelMap: { [key: string]: string } = {
      junior: "Mới vào nghề",
      mid: "Trung cấp",
      senior: "Cao cấp",
    };
    return levelMap[level || ""] || level || "Không xác định";
  };

  const getApplicationStatusInfo = (status: string | null) => {
    if (!status) {
      return {
        label: "Ứng tuyển ngay",
        backgroundColor: colors.primary,
        textColor: colors.white,
        disabled: false,
      };
    }

    const statusMap: {
      [key: string]: {
        label: string;
        backgroundColor: string;
        textColor: string;
      };
    } = {
      pending: {
        label: "Đang chờ phản hồi",
        backgroundColor: "#FFF3E0",
        textColor: "#F57C00",
      },
      rejected: {
        label: "Đã từ chối",
        backgroundColor: "#FFEBEE",
        textColor: "#C62828",
      },
      interview: {
        label: "Nhận phỏng vấn",
        backgroundColor: "#F3E5F5",
        textColor: "#6A1B9A",
      },
      hired: {
        label: "Đã được nhận làm",
        backgroundColor: "#E8F5E9",
        textColor: "#2E7D32",
      },
    };

    return {
      ...statusMap[status],
      disabled: status !== "rejected",
    };
  };

  const handleShare = async () => {
    if (!job) return;
    try {
      await Share.share({
        message: `Công việc: ${job.title}\nCông ty: ${
          job.companies?.name
        }\nMức lương: ${formatSalary(
          job.salary_min,
          job.salary_max,
          job.salary_currency
        )}\nĐịa điểm: ${job.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </SidebarLayout>
    );
  }

  if (!job) {
    return (
      <SidebarLayout>
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
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.primary,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.white,
              fontFamily: Fonts.sans,
            }}
          >
            Chi tiết công việc
          </Text>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Job Header Info */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              marginBottom: 12,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: colors.primary,
                    marginBottom: 4,
                    fontFamily: Fonts.sans,
                  }}
                >
                  {job.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textGray,
                    marginBottom: 8,
                    fontFamily: Fonts.sans,
                  }}
                >
                  {job.companies?.name || "Công ty"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSaved(!isSaved)}
                style={{
                  padding: 8,
                }}
              >
                <MaterialCommunityIcons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={28}
                  color={isSaved ? "#E63946" : colors.textGray}
                />
              </TouchableOpacity>
            </View>

            {/* Quick Info */}
            <View style={{ flexDirection: "row", marginBottom: 12, gap: 8 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primarySoftBg,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textDark,
                    marginLeft: 6,
                    fontWeight: "500",
                    fontFamily: Fonts.sans,
                  }}
                >
                  {job.view_count}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: job.is_active ? "#E8F5E9" : "#FFEBEE",
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <MaterialCommunityIcons
                  name={job.is_active ? "check-circle" : "close-circle"}
                  size={16}
                  color={job.is_active ? "#2E7D32" : "#C62828"}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: job.is_active ? "#2E7D32" : "#C62828",
                    marginLeft: 6,
                    fontWeight: "500",
                    fontFamily: Fonts.sans,
                  }}
                >
                  {job.is_active ? "Đang tuyển" : "Đóng"}
                </Text>
              </View>
            </View>

            {/* Salary & Location */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#FFF3E0",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="cash"
                    size={18}
                    color="#F57C00"
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Mức lương
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#F57C00",
                      marginTop: 2,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {formatSalary(
                      job.salary_min,
                      job.salary_max,
                      job.salary_currency
                    )}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#E8F5E9",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#2E7D32"
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Địa điểm
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textDark,
                      marginTop: 2,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {job.location}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#FCE4EC",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="calendar"
                    size={18}
                    color="#C2185B"
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Hạn chót
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textDark,
                      marginTop: 2,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {formatDate(job.deadline)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              marginHorizontal: 0,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: colors.primarySoftBg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="file-document"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textDark,
                  fontFamily: Fonts.sans,
                }}
              >
                Mô tả công việc
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.textGray,
                lineHeight: 20,
                fontFamily: Fonts.sans,
              }}
            >
              {job.description}
            </Text>
          </View>

          {/* Requirements */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              marginHorizontal: 0,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "#FCE4EC",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="clipboard-check"
                  size={18}
                  color="#C2185B"
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textDark,
                  fontFamily: Fonts.sans,
                }}
              >
                Yêu cầu công việc
              </Text>
            </View>
            {job.requirements &&
              job.requirements.split("\n").map(
                (req: string, idx: number) =>
                  req.trim() && (
                    <View
                      key={idx}
                      style={{ flexDirection: "row", marginBottom: 10 }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: "#FFF3E0",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 10,
                          marginTop: 2,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#F57C00"
                        />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: colors.textDark,
                          lineHeight: 18,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {req}
                      </Text>
                    </View>
                  )
              )}
          </View>

          {/* Job Type & Experience */}
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              marginHorizontal: 0,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "#E8F5E9",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="briefcase"
                  size={18}
                  color="#2E7D32"
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textDark,
                  fontFamily: Fonts.sans,
                }}
              >
                Thông tin bổ sung
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    fontFamily: Fonts.sans,
                  }}
                >
                  Loại công việc
                </Text>
                <View
                  style={{
                    marginTop: 6,
                    backgroundColor: colors.primarySoftBg,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.primary,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {formatJobType(job.job_type)}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    fontFamily: Fonts.sans,
                  }}
                >
                  Cấp độ
                </Text>
                <View
                  style={{
                    marginTop: 6,
                    backgroundColor: "#FCE4EC",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#C2185B",
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {formatExperienceLevel(job.experience_level)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  fontFamily: Fonts.sans,
                }}
              >
                Ngành nghề
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginTop: 6,
                  fontFamily: Fonts.sans,
                }}
              >
                {job.companies?.industry || "Không xác định"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            gap: 8,
          }}
        >
          {(() => {
            const statusInfo = getApplicationStatusInfo(applicationStatus);
            return (
              <>
                <TouchableOpacity
                  onPress={
                    applicationStatus && applicationStatus !== "rejected"
                      ? undefined
                      : handleApplyModal
                  }
                  disabled={
                    applicationStatus !== null &&
                    applicationStatus !== "rejected"
                  }
                  style={{
                    backgroundColor: statusInfo.backgroundColor,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    shadowColor: colors.shadowLight,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                    opacity:
                      applicationStatus && applicationStatus !== "rejected"
                        ? 0.7
                        : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: statusInfo.textColor,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {statusInfo.label}
                  </Text>
                </TouchableOpacity>
              </>
            );
          })()}
        </View>

        {/* Apply Modal */}
        <Modal
          visible={showApplyModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowApplyModal(false)}
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "transparent",
              }}
            >
              <View
                style={{
                  backgroundColor: colors.white,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 16,
                  paddingTop: 35,
                  maxHeight: "90%",
                }}
              >
                {/* Modal Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.textDark,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Xác nhận ứng tuyển
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowApplyModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      backgroundColor: colors.bgNeutral,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color={colors.textGray}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Job Info */}
                  <View
                    style={{
                      backgroundColor: colors.primarySoftBg,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textGray,
                        marginBottom: 4,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      Công việc
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.primary,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {job?.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textGray,
                        marginTop: 4,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {job?.companies?.name}
                    </Text>
                  </View>

                  {/* User Info Section */}
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textDark,
                        marginBottom: 12,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      Thông tin ứng viên
                    </Text>

                    {/* Name */}
                    <View
                      style={{
                        backgroundColor: colors.bgNeutral,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 4,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        Họ và tên
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {userProfile?.full_name || "Chưa cập nhật"}
                      </Text>
                    </View>

                    {/* Email */}
                    <View
                      style={{
                        backgroundColor: colors.bgNeutral,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 4,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        Email
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {userProfile?.email || "Chưa cập nhật"}
                      </Text>
                    </View>

                    {/* Phone */}
                    <View
                      style={{
                        backgroundColor: colors.bgNeutral,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 4,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        Số điện thoại
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {userProfile?.phone || "Chưa cập nhật"}
                      </Text>
                    </View>

                    {/* Location */}
                    <View
                      style={{
                        backgroundColor: colors.bgNeutral,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 4,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        Địa chỉ
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {userProfile?.location || "Chưa cập nhật"}
                      </Text>
                    </View>

                    {/* Experience */}
                    <View
                      style={{
                        backgroundColor: colors.bgNeutral,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 4,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        Năm kinh nghiệm
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {candidateProfile?.years_of_experience || 0} năm
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    paddingVertical: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderLight,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowApplyModal(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.primary,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmitApplication}
                    disabled={applying}
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      opacity: applying ? 0.6 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.white,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {applying ? "Đang gửi..." : "Xác nhận ứng tuyển"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SidebarLayout>
  );
}

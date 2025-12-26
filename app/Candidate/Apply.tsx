import { authService } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";
import SidebarLayout, { useSidebar } from "../Component/SidebarLayout";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  salary: string;
  location: string;
  appliedDate: string;
  status: "pending" | "interview" | "rejected";
  statusVn: string;
  coverLetter?: string;
}

export default function ApplyScreen() {
  return (
    <SidebarLayout>
      <ApplyContent />
    </SidebarLayout>
  );
}

function ApplyContent() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [fullName, setFullName] = React.useState("Người dùng");

  React.useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();

      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Fetch user full name from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || "Người dùng");
      }

      // Step 1: Get candidate_id from candidate_profiles table
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!candidateData) {
        console.error("No candidate profile found", candidateError);
        setApplications([]);
        setLoading(false);
        return;
      }

      const candidateId = candidateData.id;

      // Step 2: Get job_applications for this candidate
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from("job_applications")
        .select("id, job_id, status, applied_at")
        .eq("candidate_id", candidateId)
        .order("applied_at", { ascending: false });

      if (!jobAppsData || jobAppsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Step 3: Get job details for all jobs applied to
      const jobIds = jobAppsData.map((app) => app.job_id);
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(
          `id, title, location, salary_min, salary_max, salary_currency, created_at,
           companies(name, logo_url)`
        )
        .in("id", jobIds);

      // Step 4: Combine data
      const applicationsWithDetails: Application[] = jobAppsData.map(
        (jobApp) => {
          const job = jobsData?.find((j) => j.id === jobApp.job_id);
          const company = (job as any)?.companies;

          const salaryRange =
            job?.salary_min && job?.salary_max
              ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${
                  job.salary_currency || "VND"
                }`
              : "Thương lượng";

          const appliedDate = getTimeAgo(jobApp.applied_at);

          const statusMap: {
            [key: string]: { status: Application["status"]; statusVn: string };
          } = {
            pending: { status: "pending", statusVn: "Đang chờ" },
            interview: { status: "interview", statusVn: "Phỏng vấn" },
            rejected: { status: "rejected", statusVn: "Từ chối" },
          };

          const statusInfo = statusMap[jobApp.status] || {
            status: "pending",
            statusVn: "Đang chờ",
          };

          return {
            id: jobApp.id,
            jobId: job?.id.toString() || "",
            jobTitle: job?.title || "Job",
            company: company?.name || "Unknown Company",
            salary: salaryRange,
            location: job?.location || "Unknown Location",
            appliedDate,
            status: statusInfo.status,
            statusVn: statusInfo.statusVn,
          };
        }
      );

      setApplications(applicationsWithDetails);
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsDiff < 60) return "Vừa xong";
    if (secondsDiff < 3600) return `${Math.floor(secondsDiff / 60)} phút trước`;
    if (secondsDiff < 86400)
      return `${Math.floor(secondsDiff / 3600)} giờ trước`;
    if (secondsDiff < 604800)
      return `${Math.floor(secondsDiff / 86400)} ngày trước`;
    return `${Math.floor(secondsDiff / 604800)} tuần trước`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "interview":
        return "#2196F3";
      case "rejected":
        return "#E63946";
      default:
        return colors.textGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "clock-outline";
      case "interview":
        return "video";
      case "rejected":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const filteredApplications = filterStatus
    ? applications.filter((app) => app.status === filterStatus)
    : applications;

  const ApplicationCard = ({ item }: { item: Application }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/Candidate/JobDetail",
          params: { id: item.jobId },
        } as any)
      }
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: colors.shadowLight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
              fontSize: 16,
              fontWeight: "600",
              color: colors.textDark,
              marginBottom: 4,
            }}
          >
            {item.jobTitle}
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.textGray, marginBottom: 4 }}
          >
            {item.company}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: getStatusColor(item.status),
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={14}
            color="white"
            style={{ marginRight: 4 }}
          />
          <Text style={{ fontSize: 11, color: "white", fontWeight: "600" }}>
            {item.statusVn}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color={colors.primary}
          />
          <Text
            style={{
              fontSize: 12,
              color: colors.textGray,
              marginLeft: 4,
              marginRight: 16,
            }}
          >
            {item.location}
          </Text>
        </View>
        <Text
          style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}
        >
          {item.salary}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
        }}
      >
        <MaterialCommunityIcons
          name="calendar"
          size={14}
          color={colors.textGray}
        />
        <Text style={{ fontSize: 11, color: colors.textGray, marginLeft: 6 }}>
          Nộp {item.appliedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.bgNeutral,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Modern Header Bar */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 36,
              paddingBottom: 12,
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 4,
            }}
          >
            {/* Header Top - Logo and Sidebar Toggle */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Sidebar Toggle Button - Left Side */}
              <TouchableOpacity
                onPress={toggleSidebar}
                style={{
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <MaterialCommunityIcons
                  name="menu"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="file-check"
                  size={28}
                  color={colors.white}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.white,
                  }}
                >
                  Đơn Ứng Tuyển
                </Text>
              </View>

              {/* Notification Button - Right Side */}
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="bell"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
          >
            {/* Stats */}
            <View
              style={{
                backgroundColor: colors.primarySoftBg,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="file-check"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
                >
                  Tổng số
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 4,
                  }}
                >
                  {applications.length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="video"
                  size={24}
                  color="#2196F3"
                />
                <Text
                  style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
                >
                  Phỏng vấn
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 4,
                  }}
                >
                  {applications.filter((a) => a.status === "interview").length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color="#E63946"
                />
                <Text
                  style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
                >
                  Từ chối
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 4,
                  }}
                >
                  {applications.filter((a) => a.status === "rejected").length}
                </Text>
              </View>
            </View>

            {/* Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
            >
              <TouchableOpacity
                onPress={() => setFilterStatus(null)}
                style={{
                  backgroundColor: !filterStatus
                    ? colors.primary
                    : colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: !filterStatus ? 0 : 1,
                  borderColor: colors.borderLight,
                }}
              >
                <Text
                  style={{
                    color: !filterStatus ? colors.white : colors.textDark,
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>

              {[
                {
                  status: "pending",
                  label: "Chờ xử lý",
                  icon: "clock-outline",
                },
                { status: "interview", label: "Phỏng vấn", icon: "video" },
                { status: "rejected", label: "Từ chối", icon: "close-circle" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.status}
                  onPress={() => setFilterStatus(filter.status)}
                  style={{
                    backgroundColor:
                      filterStatus === filter.status
                        ? colors.primarySoftBg
                        : colors.white,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor:
                      filterStatus === filter.status
                        ? colors.primary
                        : colors.borderLight,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                      name={filter.icon as any}
                      size={14}
                      color={
                        filterStatus === filter.status
                          ? colors.primary
                          : colors.textGray
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color:
                          filterStatus === filter.status
                            ? colors.primary
                            : colors.textDark,
                        fontWeight:
                          filterStatus === filter.status ? "600" : "500",
                        fontSize: 13,
                      }}
                    >
                      {filter.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <FlatList
                data={filteredApplications}
                renderItem={ApplicationCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            ) : (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={48}
                  color={colors.textGray}
                  style={{ marginBottom: 12 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.textDark,
                    marginBottom: 8,
                  }}
                >
                  Không có đơn ứng tuyển
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textGray,
                    textAlign: "center",
                  }}
                >
                  Hãy tìm và ứng tuyển các công việc phù hợp
                </Text>
              </View>
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

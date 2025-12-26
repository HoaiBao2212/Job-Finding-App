import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { supabase } from "../../lib/supabase";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout, {
  useSidebar,
} from "../Component/EmployerSidebarLayout";

interface Interview {
  id: number;
  job_id: number;
  company_id: number;
  start_time: string;
  end_time: string;
  timezone: string;
  type: "online" | "offline";
  meeting_link: string | null;
  location: string | null;
  status: string;
  created_at: string;
  note: string | null;
  job_title: string;
  participant_count: number;
}

type TabType = "upcoming" | "past" | "canceled";

export default function InterviewScheduleScreen() {
  return (
    <EmployerSidebarLayout>
      <InterviewScheduleContent />
    </EmployerSidebarLayout>
  );
}

function InterviewScheduleContent() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Load data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Get employer profile
      const { data: employers, error: employerError } = await supabase
        .from("employers")
        .select("id, company_id")
        .eq("user_id", user.id)
        .single();

      if (employerError) throw employerError;
      if (!employers) {
        showAlert("Error", "Employer profile not found");
        return;
      }

      setEmployerId(employers.id);
      setCompanyId(employers.company_id);

      // Fetch interviews with participant counts
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select(
          `
          id,
          job_id,
          company_id,
          start_time,
          end_time,
          timezone,
          type,
          meeting_link,
          location,
          status,
          created_at,
          note,
          jobs(title),
          interview_participants(id)
        `
        )
        .eq("company_id", employers.company_id)
        .order("start_time", { ascending: false });

      if (interviewsError) throw interviewsError;

      const formatted: Interview[] = (interviewsData || []).map(
        (interview: any) => ({
          id: interview.id,
          job_id: interview.job_id,
          company_id: interview.company_id,
          start_time: interview.start_time,
          end_time: interview.end_time,
          timezone: interview.timezone || "Asia/Ho_Chi_Minh",
          type: interview.type,
          meeting_link: interview.meeting_link,
          location: interview.location,
          status: interview.status,
          created_at: interview.created_at,
          note: interview.note,
          job_title: interview.jobs?.title || "Unknown",
          participant_count: interview.interview_participants?.length || 0,
        })
      );

      setInterviews(formatted);
    } catch (error) {
      console.error("Error loading interviews:", error);
      showAlert("Error", "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter interviews based on active tab and search
  useEffect(() => {
    let filtered = interviews;
    const now = new Date();

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (interview) =>
          (interview.status === "scheduled" ||
            interview.status === "rescheduled") &&
          new Date(interview.start_time) >= now
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (interview) =>
          new Date(interview.start_time) < now ||
          interview.status === "done" ||
          interview.status === "canceled"
      );
    } else if (activeTab === "canceled") {
      filtered = filtered.filter(
        (interview) => interview.status === "canceled"
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((interview) =>
        interview.job_title.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(
        (interview) => new Date(interview.start_time) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (interview) => new Date(interview.start_time) <= toDate
      );
    }

    setFilteredInterviews(filtered);
  }, [interviews, activeTab, searchQuery, dateFrom, dateTo]);

  const formatDateTime = (dateString: string, timezone: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
      case "rescheduled":
        return { bg: "#E3F2FD", text: "#1976D2" };
      case "done":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "canceled":
        return { bg: "#FFEBEE", text: "#D32F2F" };
      default:
        return { bg: colors.bgNeutral, text: colors.textGray };
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      scheduled: "Đã xếp lịch",
      rescheduled: "Xếp lịch lại",
      done: "Hoàn tất",
      canceled: "Đã hủy",
    };
    return statusLabels[status] || status;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 36,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity
            onPress={toggleSidebar}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.12)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              marginRight: 16,
            }}
          >
            <MaterialCommunityIcons
              name="menu"
              size={22}
              color={colors.white}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: colors.white,
                marginBottom: 4,
              }}
            >
              Lịch phỏng vấn 📋
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                fontWeight: "500",
              }}
            >
              Quản lý các buổi phỏng vấn
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={{ padding: 16, backgroundColor: colors.white }}>
        <TextInput
          placeholder="Tìm kiếm theo tên công việc..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textGray}
          style={{
            backgroundColor: colors.bgNeutral,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
            color: colors.textDark,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <TextInput
            placeholder="Từ ngày"
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholderTextColor={colors.textGray}
            style={{
              flex: 1,
              backgroundColor: colors.bgNeutral,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.textDark,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          />
          <TextInput
            placeholder="Đến ngày"
            value={dateTo}
            onChangeText={setDateTo}
            placeholderTextColor={colors.textGray}
            style={{
              flex: 1,
              backgroundColor: colors.bgNeutral,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.textDark,
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          />
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["upcoming", "past", "canceled"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor:
                  activeTab === tab ? colors.primary : colors.bgNeutral,
                borderWidth: 1,
                borderColor:
                  activeTab === tab ? colors.primary : colors.borderLight,
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? colors.white : colors.textDark,
                  fontSize: 12,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {tab === "upcoming"
                  ? "Sắp tới"
                  : tab === "past"
                  ? "Đã qua"
                  : "Đã hủy"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interview List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 40,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredInterviews.length === 0 ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={colors.textGray}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                color: colors.textGray,
                fontSize: 16,
                fontWeight: "500",
              }}
            >
              Không có phỏng vấn
            </Text>
          </View>
        ) : (
          <View style={{ padding: 12 }}>
            {filteredInterviews.map((interview) => (
              <TouchableOpacity
                key={interview.id}
                onPress={() =>
                  router.push({
                    pathname: "/Employer/InterviewScheduleDetail",
                    params: { id: interview.id },
                  })
                }
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  marginBottom: 12,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 14,
                      fontWeight: "600",
                      flex: 1,
                    }}
                  >
                    {interview.job_title}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: getStatusColor(interview.status).bg,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: getStatusColor(interview.status).text,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {getStatusLabel(interview.status)}
                    </Text>
                  </View>
                </View>

                {/* Date and Time */}
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      color: colors.textGray,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    {formatDateTime(interview.start_time, interview.timezone)}
                  </Text>
                </View>

                {/* Type and Meta Info */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  {/* Type Badge */}
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: "#F0F2F5",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textDark,
                        fontSize: 11,
                        fontWeight: "500",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          interview.type === "online"
                            ? "video-outline"
                            : "map-marker-outline"
                        }
                        size={11}
                        color={colors.textDark}
                      />{" "}
                      {interview.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                    </Text>
                  </View>

                  {/* Meeting Link Indicator */}
                  {interview.meeting_link && (
                    <MaterialCommunityIcons
                      name="link-variant"
                      size={14}
                      color={colors.primary}
                    />
                  )}

                  {/* Location Indicator */}
                  {interview.location && (
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color={colors.primary}
                    />
                  )}

                  {/* Participant Count */}
                  <Text
                    style={{
                      color: colors.textGray,
                      fontSize: 12,
                      marginLeft: "auto",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="account-multiple-outline"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    {interview.participant_count} ứng viên
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setAlertVisible(false),
          },
        ]}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

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

interface InterviewSchedule {
  id: string;
  jobTitle: string;
  company: string;
  jobId: string;
  companyId: string;
  startTime: string;
  endTime: string;
  interviewType: "online" | "offline";
  location?: string | null;
  meetingLink?: string | null;
  timezone: string;
  status: "scheduled" | "completed" | "cancelled";
  statusVn: string;
  notes?: string | null;
  appliedDate: string;
  employerEmail?: string | null;
  employerPhone?: string | null;
}

export default function ScheduleScreen() {
  return (
    <SidebarLayout>
      <ScheduleContent />
    </SidebarLayout>
  );
}

function ScheduleContent() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
  const [schedules, setSchedules] = React.useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();

      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Step 1: Get candidate_id from candidate_profiles table
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!candidateData) {
        console.error("No candidate profile found", candidateError);
        setSchedules([]);
        setLoading(false);
        return;
      }

      const candidateId = candidateData.id;

      // Step 2: Get job_applications with interview_id for this candidate
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from("job_applications")
        .select("id, job_id, interview_id, applied_at, status")
        .eq("candidate_id", candidateId)
        .not("interview_id", "is", null)
        .order("applied_at", { ascending: false });

      if (!jobAppsData || jobAppsData.length === 0) {
        setSchedules([]);
        setLoading(false);
        return;
      }

      // Step 3: Get interview details for all non-null interview_ids
      const interviewIds = jobAppsData
        .map((app) => app.interview_id)
        .filter((id): id is number => id !== null);

      const { data: interviewsData } = await supabase
        .from("interviews")
        .select(
          "id, job_id, company_id, start_time, end_time, timezone, type, meeting_link, location, note, status"
        )
        .in("id", interviewIds);

      // Step 4: Get job details for all jobs applied to with interviews
      const jobIds = jobAppsData.map((app) => app.job_id);
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(
          `id, title, location, created_by_employer_id,
           companies(id, name, logo_url)`
        )
        .in("id", jobIds);

      // Step 5: Get employer contact info
      const employerIds = (jobsData || [])
        .map((job: any) => job.created_by_employer_id)
        .filter((id): id is number => id !== null && id !== undefined);

      const { data: employersData } = await supabase
        .from("employers")
        .select(
          `id, user_id,
           profiles(email, phone)`
        )
        .in("id", employerIds);

      // Step 6: Combine data
      const schedulesWithDetails: InterviewSchedule[] = jobAppsData
        .filter((jobApp) => {
          const interview = interviewsData?.find(
            (i) => i.id === jobApp.interview_id
          );
          const job = jobsData?.find((j) => j.id === jobApp.job_id);
          const company = (job as any)?.companies;
          return interview && job && company;
        })
        .map((jobApp) => {
          const interview = interviewsData?.find(
            (i) => i.id === jobApp.interview_id
          )!;
          const job = jobsData?.find((j) => j.id === jobApp.job_id)!;
          const company = (job as any)?.companies;

          // Parse start_time and end_time
          const startDate = new Date(interview.start_time);
          const endDate = interview.end_time
            ? new Date(interview.end_time)
            : null;

          startDate.setHours(startDate.getHours() - 7);
          if (endDate) {
            endDate.setHours(endDate.getHours() - 7);
          }

          // Format dates and times
          const dateStr = `${startDate.getDate()}/${
            startDate.getMonth() + 1
          }/${startDate.getFullYear()}`;
          const timeStr = `${startDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${startDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}${
            endDate
              ? ` - ${endDate.getHours().toString().padStart(2, "0")}:${endDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`
              : ""
          }`;

          const appliedDate = `${new Date(jobApp.applied_at).getDate()}/${
            new Date(jobApp.applied_at).getMonth() + 1
          }/${new Date(jobApp.applied_at).getFullYear()}`;

          // Determine status
          let status: "scheduled" | "completed" | "cancelled" = "scheduled";
          if (interview.status === "done") status = "completed";
          if (interview.status === "canceled") status = "cancelled";

          // Get employer contact info
          const employer = employersData?.find(
            (e: any) => e.id === (job as any).created_by_employer_id
          );
          const employerProfile = (employer as any)?.profiles;

          return {
            id: interview.id.toString(),
            jobTitle: job.title,
            company: company.name,
            jobId: job.id.toString(),
            companyId: company.id.toString(),
            startTime: startDate.toISOString(),
            endTime: endDate?.toISOString() || "",
            interviewType: interview.type === "online" ? "online" : "offline",
            location: interview.location,
            meetingLink: interview.meeting_link,
            timezone: interview.timezone,
            status,
            statusVn:
              status === "scheduled"
                ? "Sắp diễn ra"
                : status === "completed"
                ? "Hoàn thành"
                : "Đã hủy",
            notes: interview.note,
            appliedDate,
            employerEmail: employerProfile?.email,
            employerPhone: employerProfile?.phone,
          } as InterviewSchedule;
        });

      setSchedules(schedulesWithDetails);
    } catch (error) {
      console.error("Error loading schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "#4169E1";
      case "completed":
        return "#00B050";
      case "cancelled":
        return "#E63946";
      default:
        return colors.textGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return "calendar-clock";
      case "completed":
        return "check-circle";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getDaysUntilInterview = (isoDateStr: string) => {
    const today = new Date();
    const interviewDate = new Date(isoDateStr);
    const diffTime = interviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSchedules = filterStatus
    ? schedules.filter((s) => s.status === filterStatus)
    : schedules;

  const ScheduleCard = ({ item }: { item: InterviewSchedule }) => {
    const daysLeft = getDaysUntilInterview(item.startTime);
    const startDate = new Date(item.startTime);
    const endDate = item.endTime ? new Date(item.endTime) : null;

    const dateStr = `${startDate.getDate()}/${
      startDate.getMonth() + 1
    }/${startDate.getFullYear()}`;
    const timeStr = `${startDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}${
      endDate
        ? ` - ${endDate.getHours().toString().padStart(2, "0")}:${endDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        : ""
    }`;

    return (
      <View
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
        {/* Header */}
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
              style={{
                fontSize: 13,
                color: colors.textGray,
                marginBottom: 4,
              }}
            >
              {item.company}
            </Text>
            {/* Employer Contact Info - Below Company */}
            {(item.employerEmail || item.employerPhone) && (
              <View style={{ marginTop: 8 }}>
                {item.employerEmail && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="email"
                      size={12}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.textGray,
                      }}
                    >
                      {item.employerEmail}
                    </Text>
                  </View>
                )}
                {item.employerPhone && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      size={12}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.textGray,
                      }}
                    >
                      {item.employerPhone}
                    </Text>
                  </View>
                )}
              </View>
            )}
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
            <Text
              style={{
                fontSize: 11,
                color: "white",
                fontWeight: "600",
              }}
            >
              {item.statusVn}
            </Text>
          </View>
        </View>

        {/* Interview Info */}
        <View
          style={{
            backgroundColor: colors.primarySoftBg,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textDark,
                marginRight: 16,
              }}
            >
              {dateStr}
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textDark,
              }}
            >
              {timeStr}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name={item.interviewType === "online" ? "video" : "map-marker"}
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                flex: 1,
              }}
            >
              {item.interviewType === "online"
                ? item.meetingLink || "Online"
                : item.location || "Offline"}
            </Text>
          </View>

          {daysLeft > 0 && item.status === "scheduled" && (
            <View
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                ⏰ Còn {daysLeft} ngày
              </Text>
            </View>
          )}
        </View>

        {/* Timezone Info */}
        {item.timezone && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <MaterialCommunityIcons
              name="earth"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
              }}
            >
              {item.timezone}
            </Text>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: colors.textBlue,
                marginBottom: 4,
              }}
            >
              💡 Ghi chú:
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                lineHeight: 16,
              }}
            >
              {item.notes}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
                  name="calendar-check"
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
                  Lịch Phỏng Vấn
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
                  name="calendar-check"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 8,
                  }}
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
                  {schedules.length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#4169E1"
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 8,
                  }}
                >
                  Sắp diễn ra
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 4,
                  }}
                >
                  {schedules.filter((s) => s.status === "scheduled").length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#00B050"
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginTop: 8,
                  }}
                >
                  Hoàn thành
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginTop: 4,
                  }}
                >
                  {schedules.filter((s) => s.status === "completed").length}
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
                  status: "scheduled",
                  label: "Sắp diễn ra",
                  icon: "calendar-clock",
                },
                {
                  status: "completed",
                  label: "Hoàn thành",
                  icon: "check-circle",
                },
                { status: "cancelled", label: "Đã hủy", icon: "close-circle" },
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

            {/* Schedules List */}
            {loading ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredSchedules.length > 0 ? (
              <FlatList
                data={filteredSchedules}
                renderItem={({ item }) => <ScheduleCard item={item} />}
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
                  name="calendar-blank"
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
                  Chưa có lịch phỏng vấn
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textGray,
                    textAlign: "center",
                  }}
                >
                  Các lịch phỏng vấn sẽ xuất hiện ở đây
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

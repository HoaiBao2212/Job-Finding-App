import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout, {
  useSidebar,
} from "../Component/EmployerSidebarLayout";

interface InterviewDetail {
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
  note: string | null;
  job_title: string;
  company_name: string;
  company_logo: string | null;
}

interface Participant {
  id: number;
  interview_id: number;
  application_id: number;
  candidate_id: number;
  participant_status: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_avatar: string;
}

export default function InterviewScheduleDetailScreen() {
  return (
    <EmployerSidebarLayout>
      <InterviewScheduleDetailContent />
    </EmployerSidebarLayout>
  );
}

function InterviewScheduleDetailContent() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<
    Participant[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"status" | "name">("status");

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Load interview details
  const loadInterview = useCallback(async () => {
    try {
      setLoading(true);
      if (!params.id) {
        showAlert("Error", "Interview ID not found");
        return;
      }

      const interviewId = parseInt(params.id as string);

      // Fetch interview details
      const { data: interviewData, error: interviewError } = await supabase
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
          note,
          jobs!inner(title),
          companies!inner(name, logo_url)
        `
        )
        .eq("id", interviewId)
        .single();

      if (interviewError) throw interviewError;

      const formattedInterview: InterviewDetail = {
        id: interviewData.id,
        job_id: interviewData.job_id,
        company_id: interviewData.company_id,
        start_time: interviewData.start_time,
        end_time: interviewData.end_time,
        timezone: interviewData.timezone || "Asia/Ho_Chi_Minh",
        type: interviewData.type,
        meeting_link: interviewData.meeting_link,
        location: interviewData.location,
        status: interviewData.status,
        note: interviewData.note,
        job_title: (interviewData.jobs as any)?.title || "Unknown",
        company_name: (interviewData.companies as any)?.name || "Unknown",
        company_logo: (interviewData.companies as any)?.logo_url,
      };

      setInterview(formattedInterview);

      // Fetch participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("interview_participants")
          .select(
            `
          id,
          interview_id,
          application_id,
          candidate_id,
          participant_status,
          candidate_profiles(
            user:profiles(
              full_name,
              email,
              phone,
              avatar_url
            )
          )
        `
          )
          .eq("interview_id", interviewId);

      if (participantsError) throw participantsError;

      const formattedParticipants: Participant[] = (participantsData || []).map(
        (p: any) => ({
          id: p.id,
          interview_id: p.interview_id,
          application_id: p.application_id,
          candidate_id: p.candidate_id,
          participant_status: p.participant_status,
          candidate_name: p.candidate_profiles?.user?.full_name || "Unknown",
          candidate_email: p.candidate_profiles?.user?.email || "N/A",
          candidate_phone: p.candidate_profiles?.user?.phone || "N/A",
          candidate_avatar: p.candidate_profiles?.user?.avatar_url || "",
        })
      );

      setParticipants(formattedParticipants);
    } catch (error) {
      console.error("Error loading interview:", error);
      showAlert("Error", "Failed to load interview details");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Refresh interview details when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInterview();
    }, [loadInterview])
  );

  // Filter and sort participants
  useEffect(() => {
    let filtered = participants;

    // Search by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.candidate_name.toLowerCase().includes(query) ||
          p.candidate_email.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "status") {
      const statusOrder = { invited: 0, confirmed: 1, declined: 2, no_show: 3 };
      filtered = filtered.sort(
        (a, b) =>
          (statusOrder[a.participant_status as keyof typeof statusOrder] ||
            999) -
          (statusOrder[b.participant_status as keyof typeof statusOrder] || 999)
      );
    } else if (sortBy === "name") {
      filtered = filtered.sort((a, b) =>
        a.candidate_name.localeCompare(b.candidate_name)
      );
    }

    setFilteredParticipants(filtered);
  }, [participants, searchQuery, sortBy]);

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

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const minutes = Math.round((end - start) / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    } catch {
      return "N/A";
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

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case "invited":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "confirmed":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "declined":
        return { bg: "#FFEBEE", text: "#D32F2F" };
      case "no_show":
        return { bg: "#F5F5F5", text: "#616161" };
      default:
        return { bg: colors.bgNeutral, text: colors.textGray };
    }
  };

  const getParticipantStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      invited: "Đã gửi lời mời",
      confirmed: "Xác nhận",
      declined: "Từ chối",
      no_show: "Không đến",
    };
    return statusLabels[status] || status;
  };

  const handleCopyMeetingLink = () => {
    if (interview?.meeting_link) {
      // Note: In React Native, we might use a clipboard library
      // For now, we'll show an alert with the link
      showAlert(
        "Meeting Link",
        `Link: ${interview.meeting_link}\n\nPlease copy it manually.`
      );
    }
  };

  const handleOpenMeetingLink = () => {
    if (interview?.meeting_link) {
      Linking.openURL(interview.meeting_link).catch(() => {
        showAlert("Error", "Cannot open meeting link");
      });
    }
  };

  const handleMarkAsDone = () => {
    showAlert("TODO", "Mark interview as done - Implementation pending");
  };

  const handleCancelInterview = () => {
    showAlert("TODO", "Cancel interview - Implementation pending");
  };

  const handleRescheduleInterview = () => {
    showAlert("TODO", "Reschedule interview - Implementation pending");
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!interview) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textGray }}>Interview not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/Employer/InterviewSchedule")}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={colors.white}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text
            style={{
              color: colors.white,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Chi tiết phỏng vấn
          </Text>
        </View>
        <TouchableOpacity onPress={toggleSidebar}>
          <MaterialCommunityIcons name="menu" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Interview Info Section */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.white,
            marginBottom: 8,
          }}
        >
          {/* Job and Company Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {interview.company_logo && (
              <Image
                source={{ uri: interview.company_logo }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 12,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {interview.job_title}
              </Text>
              <Text
                style={{
                  color: colors.textGray,
                  fontSize: 13,
                }}
              >
                {interview.company_name}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 4,
                backgroundColor: getStatusColor(interview.status).bg,
              }}
            >
              <Text
                style={{
                  color: getStatusColor(interview.status).text,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {getStatusLabel(interview.status)}
              </Text>
            </View>
          </View>

          {/* Date and Time Info */}
          <View
            style={{
              backgroundColor: colors.bgNeutral,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
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
                Thời gian bắt đầu
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {formatDateTime(interview.start_time, interview.timezone)}
              </Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  color: colors.textGray,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Thời lượng
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {calculateDuration(interview.start_time, interview.end_time)}
              </Text>
            </View>

            <View>
              <Text
                style={{
                  color: colors.textGray,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="earth"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Múi giờ
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {interview.timezone}
              </Text>
            </View>
          </View>

          {/* Type and Location/Meeting Link */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: colors.textGray,
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              Hình thức phỏng vấn
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 4,
                  backgroundColor: "#F0F2F5",
                }}
              >
                <Text
                  style={{
                    color: colors.textDark,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  <MaterialCommunityIcons
                    name={
                      interview.type === "online"
                        ? "video-outline"
                        : "map-marker-outline"
                    }
                    size={12}
                    color={colors.textDark}
                  />{" "}
                  {interview.type === "online" ? "Trực tuyến" : "Trực tiếp"}
                </Text>
              </View>
            </View>

            {interview.type === "online" && interview.meeting_link && (
              <View
                style={{
                  backgroundColor: colors.bgNeutral,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.textGray,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  Link phòng họp
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      flex: 1,
                      textDecorationLine: "underline",
                    }}
                    numberOfLines={1}
                  >
                    {interview.meeting_link}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyMeetingLink}
                    style={{ padding: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="content-copy"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleOpenMeetingLink}
                    style={{ padding: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {interview.type === "offline" && interview.location && (
              <View
                style={{
                  backgroundColor: colors.bgNeutral,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.textGray,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={12}
                    color={colors.textGray}
                  />{" "}
                  Địa điểm
                </Text>
                <Text
                  style={{
                    color: colors.textDark,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  {interview.location}
                </Text>
              </View>
            )}
          </View>

          {/* Note Section */}
          {interview.note && (
            <View
              style={{
                backgroundColor: colors.bgNeutral,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text
                style={{
                  color: colors.textGray,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Ghi chú
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 13,
                }}
              >
                {interview.note}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.white,
            marginBottom: 8,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleRescheduleInterview}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: colors.bgNeutral,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={18}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              Xếp lịch lại
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMarkAsDone}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: "#E8F5E9",
              borderWidth: 1,
              borderColor: "#C8E6C9",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color="#388E3C"
            />
            <Text
              style={{
                color: "#388E3C",
                fontSize: 12,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              Hoàn tất
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancelInterview}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: "#FFEBEE",
              borderWidth: 1,
              borderColor: "#FFCDD2",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={18}
              color="#D32F2F"
            />
            <Text
              style={{
                color: "#D32F2F",
                fontSize: 12,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              Hủy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Participants Section */}
        <View style={{ padding: 16, backgroundColor: colors.white }}>
          <Text
            style={{
              color: colors.textDark,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Ứng viên ({participants.length})
          </Text>

          {/* Search and Sort */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              placeholder="Tìm kiếm ứng viên..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textGray}
              style={{
                backgroundColor: colors.bgNeutral,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 8,
                color: colors.textDark,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setSortBy(sortBy === "status" ? "name" : "status")
                }
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor:
                    sortBy === "status" ? colors.primary : colors.bgNeutral,
                  borderWidth: 1,
                  borderColor:
                    sortBy === "status" ? colors.primary : colors.borderLight,
                }}
              >
                <Text
                  style={{
                    color: sortBy === "status" ? colors.white : colors.textDark,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  <MaterialCommunityIcons
                    name="sort"
                    size={12}
                    color={sortBy === "status" ? colors.white : colors.textDark}
                  />{" "}
                  {sortBy === "status" ? "Theo trạng thái" : "Theo tên"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Participant List */}
          {filteredParticipants.length === 0 ? (
            <Text
              style={{
                color: colors.textGray,
                fontSize: 14,
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              Không có ứng viên
            </Text>
          ) : (
            filteredParticipants.map((participant) => (
              <TouchableOpacity
                key={participant.id}
                onPress={() =>
                  router.push({
                    pathname: "/Employer/InterviewCandidateDetail",
                    params: {
                      interviewId: params.id,
                      candidateId: participant.candidate_id,
                    },
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                {participant.candidate_avatar && (
                  <Image
                    source={{ uri: participant.candidate_avatar }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                    }}
                  />
                )}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 14,
                      fontWeight: "500",
                      marginBottom: 2,
                    }}
                  >
                    {participant.candidate_name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textGray,
                      fontSize: 12,
                    }}
                  >
                    {participant.candidate_email}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 4,
                    backgroundColor: getParticipantStatusColor(
                      participant.participant_status
                    ).bg,
                  }}
                >
                  <Text
                    style={{
                      color: getParticipantStatusColor(
                        participant.participant_status
                      ).text,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {getParticipantStatusLabel(participant.participant_status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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

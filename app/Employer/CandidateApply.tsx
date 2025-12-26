import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
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
import { employerService } from "../../lib/services/employerService";
import { jobService } from "../../lib/services/jobService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout, {
  useSidebar,
} from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert.hook";

interface Candidate {
  id: number;
  job_id: number;
  job_title?: string;
  candidate_id: number;
  status: string;
  applied_at: string;
  interview_id?: number;
  interview_participant_status?: string;
  candidate_profiles?: {
    id: number;
    user_id: string;
    headline?: string;
    years_of_experience?: number;
    profiles?: {
      id: string;
      full_name?: string;
      email?: string;
      phone?: string;
      avatar_url?: string;
    };
  };
}

export default function CandidateApplyScreen() {
  return (
    <EmployerSidebarLayout>
      <CandidateApplyContent />
    </EmployerSidebarLayout>
  );
}

function CandidateApplyContent() {
  const router = useRouter();
  const { toggleSidebar, isOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "reviewing" | "accepted" | "rejected" | "interview"
  >("all");
  const [filterJobId, setFilterJobId] = useState<number | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const { alertState, showAlert, hideAlert } = useAlert();

  useEffect(() => {
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

      const employer = await employerService.getEmployerProfile(user.id);
      if (employer?.id) {
        setEmployerId(employer.id);
        // Lấy danh sách công việc của employer
        const employerJobs = await jobService.getEmployerJobs(employer.id);
        setJobs(employerJobs);
        // Lấy danh sách ứng tuyển cho các công việc kèm thông tin job title
        const allApplications: any[] = [];
        for (const job of employerJobs) {
          const apps = await jobService.getApplications(job.id);
          // Thêm job_title vào mỗi application
          let appsWithJobTitle = apps.map((app: any) => ({
            ...app,
            job_title: job.title,
          }));

          // Fetch interview_participant_status for applications with status = 'interview'
          appsWithJobTitle = await Promise.all(
            appsWithJobTitle.map(async (app: any) => {
              if (app.status === "interview" && app.id) {
                try {
                  const { data: interviewParticipant, error } = await (
                    await import("../../lib/supabase")
                  ).supabase
                    .from("interview_participants")
                    .select("participant_status, interview_id")
                    .eq("application_id", app.id)
                    .single();

                  if (interviewParticipant) {
                    return {
                      ...app,
                      interview_participant_status:
                        interviewParticipant.participant_status,
                      interview_id: interviewParticipant.interview_id,
                    };
                  }
                } catch (error) {
                  console.error(
                    "Error fetching interview participant status:",
                    error
                  );
                }
              }
              return app;
            })
          );

          allApplications.push(...appsWithJobTitle);
        }
        setCandidates(allApplications);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultCandidates: Candidate[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return { bg: "#E7F5FF", text: colors.primary, label: "Mới" };
      case "reviewing":
        return { bg: "#FFF7E6", text: "#FF7A45", label: "Đang xem" };
      case "interview":
        return { bg: "#F6FFED", text: "#52C41A", label: "Phỏng vấn" };
      case "accepted":
        return { bg: "#F6FFED", text: "#52C41A", label: "Chấp nhận" };
      case "rejected":
        return { bg: "#FFF1F0", text: "#FF7875", label: "Từ chối" };
      default:
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Khác" };
    }
  };

  const getParticipantStatusColor = (status: string | undefined) => {
    switch (status) {
      case "invited":
        return { bg: "#FFF3E0", text: "#F57C00", label: "Mời phỏng vấn" };
      case "confirmed":
        return { bg: "#E8F5E9", text: "#388E3C", label: "Đã xác nhận" };
      case "declined":
        return { bg: "#FFEBEE", text: "#D32F2F", label: "Từ chối phỏng vấn" };
      case "no_show":
        return { bg: "#F5F5F5", text: "#616161", label: "Không đến" };
      case "pending":
        return { bg: "#FFF3E0", text: "#F57C00", label: "Chờ xử lý" };
      default:
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Chưa xác định" };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#52C41A";
    if (score >= 80) return "#FF7A45";
    if (score >= 70) return "#FFB800";
    return "#FF7875";
  };

  const filteredCandidates = candidates
    .filter((candidate) => {
      const candidateName = candidate.profiles?.full_name || "Không xác định";
      const candidateEmail = candidate.profiles?.email || "";
      const jobTitle = candidate.job_title || "";

      const matchesSearch =
        candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || candidate.status === filterStatus;
      const matchesJob =
        filterJobId === null || candidate.job_id === filterJobId;
      return matchesSearch && matchesStatus && matchesJob;
    })
    .sort((a, b) => {
      // Sort by status priority: new, interview, reviewing, accepted, rejected
      const statusPriority: { [key: string]: number } = {
        new: 1,
        interview: 2,
        reviewing: 3,
        accepted: 4,
        rejected: 5,
      };
      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });

  const statistics = {
    total: candidates.length,
    new: candidates.filter((c) => c.status === "new").length,
    reviewing: candidates.filter((c) => c.status === "reviewing").length,
    interview: candidates.filter((c) => c.status === "interview").length,
    accepted: candidates.filter((c) => c.status === "accepted").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    showAlert(
      "Cập nhập trạng thái",
      "Bạn có chắc chắn muốn cập nhập trạng thái ứng viên?",
      [
        { text: "Hủy", style: "cancel", onPress: () => {} },
        {
          text: "Xác nhận",
          style: "default",
          onPress: async () => {
            try {
              await jobService.updateApplicationStatus(
                applicationId,
                newStatus
              );
              // Cập nhật lại danh sách
              loadApplications();
              showAlert("Thành công", "Trạng thái ứng viên đã được cập nhập", [
                { text: "OK", style: "default", onPress: () => {} },
              ]);
            } catch (error) {
              showAlert("Lỗi", "Không thể cập nhập trạng thái");
            }
          },
        },
      ]
    );
  };

  const CandidateCard = ({ item }: { item: Candidate }) => {
    // Always use application status, not interview participant status
    const statusInfo = getStatusColor(item.status);
    const candidateName =
      item.candidate_profiles?.profiles?.full_name || "Không xác định";
    const candidateAvatar =
      item.candidate_profiles?.profiles?.avatar_url ||
      "https://i.pravatar.cc/150?img=1";
    const experience = item.candidate_profiles?.years_of_experience || 0;
    const headline = item.candidate_profiles?.headline || "";

    return (
      <TouchableOpacity
        onPress={() =>
          router.push(
            `/Employer/CandidateApplicantDetail?applicationId=${item.id}&candidateId=${item.candidate_id}`
          )
        }
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderLight,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 0,
          }}
        >
          <View
            style={{ flexDirection: "row", flex: 1, alignItems: "flex-start" }}
          >
            <Image
              source={{ uri: candidateAvatar }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginRight: 12,
                backgroundColor: colors.borderLight,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginBottom: 4,
                }}
              >
                {candidateName}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginBottom: 6,
                }}
              >
                {headline || item.job_title || "Không xác định"}
              </Text>
              {/* Job Title Tag */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: colors.primary + "15",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  {item.job_title}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="briefcase"
                  size={12}
                  color={colors.textGray}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textGray,
                  }}
                >
                  {experience} năm kinh nghiệm
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: statusInfo.bg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: statusInfo.text,
              }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingTop: 36,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 0,
            }}
          >
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
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
                  name={isOpen ? "close" : "menu"}
                  size={22}
                  color={colors.white}
                />
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "800",
                    color: colors.white,
                    marginBottom: 4,
                  }}
                >
                  Người ứng tuyển
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "500",
                  }}
                >
                  Quản lý các ứng viên ứng tuyển
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <FlatList
            data={[
              {
                id: "total",
                icon: "account-multiple",
                label: "Tổng",
                value: statistics.total,
                color: "#E7F5FF",
              },
              {
                id: "new",
                icon: "star",
                label: "Mới",
                value: statistics.new,
                color: "#E7F5FF",
              },
              {
                id: "interview",
                icon: "phone",
                label: "Phỏng vấn",
                value: statistics.interview,
                color: "#F6FFED",
              },
              {
                id: "accepted",
                icon: "check-circle",
                label: "Chấp nhận",
                value: statistics.accepted,
                color: "#F6FFED",
              },
            ]}
            renderItem={({ item }) => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: item.color,
                  borderRadius: 12,
                  padding: 12,
                  marginRight: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={colors.primary}
                  style={{ marginBottom: 6 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {item.value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.textGray,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Search and Filters */}
        <View
          style={{
            paddingHorizontal: 16,
            marginBottom: 20,
          }}
        >
          {/* Search */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.borderLight,
              paddingHorizontal: 12,
              marginBottom: 12,
              height: 44,
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.textGray}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Tìm ứng viên..."
              placeholderTextColor={colors.textGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.textDark,
              }}
            />
          </View>

          {/* Job Filter Button */}
          <TouchableOpacity
            onPress={() => setShowJobModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: filterJobId ? colors.primary : colors.borderLight,
              paddingHorizontal: 12,
              paddingVertical: 12,
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons
              name="briefcase-variant"
              size={18}
              color={filterJobId ? colors.primary : colors.textGray}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: filterJobId ? colors.primary : colors.textGray,
                fontWeight: filterJobId ? "600" : "400",
              }}
            >
              {filterJobId
                ? jobs.find((j) => j.id === filterJobId)?.title ||
                  "Chọn công việc"
                : "Chọn công việc"}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={filterJobId ? colors.primary : colors.textGray}
            />
          </TouchableOpacity>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {(
              [
                "all",
                "new",
                "reviewing",
                "interview",
                "accepted",
                "rejected",
              ] as const
            ).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor:
                    filterStatus === status ? colors.primary : colors.white,
                  borderWidth: 1,
                  borderColor:
                    filterStatus === status
                      ? colors.primary
                      : colors.borderLight,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      filterStatus === status ? colors.white : colors.textDark,
                  }}
                >
                  {status === "all"
                    ? "Tất cả"
                    : status === "new"
                    ? "Mới"
                    : status === "reviewing"
                    ? "Xem"
                    : status === "interview"
                    ? "Phỏng vấn"
                    : status === "accepted"
                    ? "Chấp nhận"
                    : "Từ chối"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Candidate List */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          {filteredCandidates.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textGray,
                  marginBottom: 12,
                }}
              >
                Tìm thấy {filteredCandidates.length} ứng viên
              </Text>
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} item={candidate} />
              ))}
            </>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
              }}
            >
              <MaterialCommunityIcons
                name="account-search"
                size={48}
                color={colors.textGray}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textDark,
                }}
              >
                Không tìm thấy ứng viên
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Job Selection Modal */}
      <Modal
        visible={showJobModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJobModal(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.white,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              marginTop: 100,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                }}
              >
                Chọn công việc
              </Text>
              <TouchableOpacity onPress={() => setShowJobModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.textDark}
                />
              </TouchableOpacity>
            </View>

            {/* Job List */}
            <ScrollView style={{ flex: 1 }}>
              {/* Clear Filter Button */}
              <TouchableOpacity
                onPress={() => {
                  setFilterJobId(null);
                  setShowJobModal(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                  backgroundColor:
                    filterJobId === null ? colors.primary + "20" : colors.white,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: filterJobId === null ? "700" : "500",
                    color:
                      filterJobId === null ? colors.primary : colors.textDark,
                  }}
                >
                  Tất cả công việc
                </Text>
              </TouchableOpacity>

              {jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => {
                    setFilterJobId(job.id);
                    setShowJobModal(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                    backgroundColor:
                      filterJobId === job.id
                        ? colors.primary + "20"
                        : colors.white,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: filterJobId === job.id ? "700" : "500",
                      color:
                        filterJobId === job.id
                          ? colors.primary
                          : colors.textDark,
                    }}
                  >
                    {job.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

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

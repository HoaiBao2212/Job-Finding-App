import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
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
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert";

interface Candidate {
  id: number;
  job_id: number;
  job_title?: string;
  candidate_id: number;
  status: string;
  applied_at: string;
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "reviewing" | "accepted" | "rejected" | "interview"
  >("all");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
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
        const jobs = await jobService.getEmployerJobs(employer.id);
        // Lấy danh sách ứng tuyển cho các công việc kèm thông tin job title
        const allApplications: any[] = [];
        for (const job of jobs) {
          const apps = await jobService.getApplications(job.id);
          // Thêm job_title vào mỗi application
          const appsWithJobTitle = apps.map((app: any) => ({
            ...app,
            job_title: job.title,
          }));
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
      return matchesSearch && matchesStatus;
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
              await jobService.updateApplicationStatus(applicationId, newStatus);
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
    const statusInfo = getStatusColor(item.status);
    const candidateName = item.candidate_profiles?.profiles?.full_name || "Không xác định";
    const candidateEmail = item.candidate_profiles?.profiles?.email || "";
    const candidatePhone = item.candidate_profiles?.profiles?.phone || "";
    const candidateAvatar = item.candidate_profiles?.profiles?.avatar_url || "https://i.pravatar.cc/150?img=1";
    const experience = item.candidate_profiles?.years_of_experience || 0;
    const headline = item.candidate_profiles?.headline || "";

    return (
      <TouchableOpacity
        onPress={() =>
          setSelectedCandidate(selectedCandidate === item.id ? null : item.id)
        }
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor:
            selectedCandidate === item.id ? colors.primary : colors.borderLight,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        {/* Main Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Image
            source={{ uri: candidateAvatar }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              marginRight: 12,
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
              }}
            >
              {candidateName}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {headline || item.job_title || "Không xác định"}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textGray,
                marginTop: 2,
              }}
            >
              📧 {candidateEmail.split("@")[0]}
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              marginLeft: 12,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: statusInfo.bg,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: statusInfo.text,
                }}
              >
                {experience}y
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Kinh nghiệm
            </Text>
          </View>
        </View>

        {/* Status and Date Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#F5F5F5",
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}
        >
          <View
            style={{
              backgroundColor: statusInfo.bg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: statusInfo.text,
              }}
            >
              {statusInfo.label}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: colors.textGray,
            }}
          >
            {new Date(item.applied_at).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        {/* Expanded Details */}
        {selectedCandidate === item.id && (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
              padding: 16,
              backgroundColor: "#FAFAFA",
            }}
          >
            {/* Contact Info */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Thông tin liên hệ
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="email"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textDark,
                  }}
                  numberOfLines={1}
                >
                  {candidateEmail}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textDark,
                  }}
                  numberOfLines={1}
                >
                  {candidatePhone}
                </Text>
              </View>
            </View>

            {/* Experience */}
            <View
              style={{
                marginBottom: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Kinh nghiệm: {experience} năm
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                }}
              >
                Công việc: {item.job_title}
              </Text>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}
            >
              {item.status !== "accepted" && item.status !== "rejected" && (
                <>
                  <TouchableOpacity
                    onPress={() => handleStatusChange(item.id, "interview")}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: "#52C41A",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.white,
                      }}
                    >
                      Phỏng vấn
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleStatusChange(item.id, "rejected")}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: "#FF7875",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.white,
                      }}
                    >
                      Từ chối
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {item.status !== "accepted" && item.status !== "rejected" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange(item.id, "accepted")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.white,
                    }}
                  >
                    Chấp nhận
                  </Text>
                </TouchableOpacity>
              )}
              {(item.status === "accepted" || item.status === "rejected") && (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.textDark,
                    }}
                  >
                    Xem hồ sơ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false}>
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
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.white,
                }}
              >
                Người ứng tuyển
              </Text>
              <View style={{ width: 28 }} />
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
                        filterStatus === status
                          ? colors.white
                          : colors.textDark,
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

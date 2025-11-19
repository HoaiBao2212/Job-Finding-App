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
  id: string;
  name: string;
  avatar: string;
  position: string;
  jobApplied: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: "new" | "reviewing" | "accepted" | "rejected" | "interview";
  score: number;
  experience: string;
  location: string;
}

export default function CandidateApplyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "reviewing" | "accepted" | "rejected" | "interview"
  >("all");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
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
        // Lấy danh sách ứng tuyển cho các công việc
        const allApplications: any[] = [];
        for (const job of jobs) {
          const apps = await jobService.getApplications(job.id);
          allApplications.push(...apps);
        }
        setCandidates(allApplications);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultCandidates: Candidate[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      position: "React Native Developer",
      jobApplied: "React Native Developer",
      email: "nguyenvana@email.com",
      phone: "+84 912 345 678",
      appliedDate: "Hôm nay",
      status: "new",
      score: 85,
      experience: "3+ năm",
      location: "TP. Hồ Chí Minh",
    },
    {
      id: "2",
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=2",
      position: "UI/UX Designer",
      jobApplied: "UI/UX Designer",
      email: "tranthib@email.com",
      phone: "+84 901 234 567",
      appliedDate: "Hôm qua",
      status: "reviewing",
      score: 92,
      experience: "2+ năm",
      location: "Hà Nội",
    },
    {
      id: "3",
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=3",
      position: "React Native Developer",
      jobApplied: "React Native Developer",
      email: "levanc@email.com",
      phone: "+84 908 765 432",
      appliedDate: "2 ngày trước",
      status: "interview",
      score: 88,
      experience: "4+ năm",
      location: "Đà Nẵng",
    },
    {
      id: "4",
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=4",
      position: "Frontend Developer",
      jobApplied: "Frontend Developer",
      email: "phamthid@email.com",
      phone: "+84 916 543 210",
      appliedDate: "3 ngày trước",
      status: "accepted",
      score: 95,
      experience: "2+ năm",
      location: "TP. Hồ Chí Minh",
    },
    {
      id: "5",
      name: "Hoàng Văn E",
      avatar: "https://i.pravatar.cc/150?img=5",
      position: "Backend Developer",
      jobApplied: "Backend Developer",
      email: "hoangvane@email.com",
      phone: "+84 917 654 321",
      appliedDate: "5 ngày trước",
      status: "rejected",
      score: 65,
      experience: "1+ năm",
      location: "Hải Phòng",
    },
    {
      id: "6",
      name: "Võ Thị F",
      avatar: "https://i.pravatar.cc/150?img=6",
      position: "React Native Developer",
      jobApplied: "React Native Developer",
      email: "vothif@email.com",
      phone: "+84 918 765 432",
      appliedDate: "1 tuần trước",
      status: "new",
      score: 78,
      experience: "1+ năm",
      location: "Cần Thơ",
    },
  ];

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
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    showAlert(
      "Cập nhập trạng thái",
      "Bạn có chắc chắn muốn cập nhập trạng thái ứng viên?",
      [
        { text: "Hủy", style: "cancel", onPress: () => hideAlert() },
        {
          text: "Xác nhận",
          style: "default",
          onPress: () => {
            showAlert("Thành công", "Trạng thái ứng viên đã được cập nhập", [
              { text: "OK", style: "default", onPress: () => hideAlert() },
            ]);
          },
        },
      ]
    );
  };

  const CandidateCard = ({ item }: { item: Candidate }) => {
    const statusInfo = getStatusColor(item.status);
    const scoreColor = getScoreColor(item.score);

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
            source={{ uri: item.avatar }}
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
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginTop: 2,
              }}
            >
              {item.position}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textGray,
                marginTop: 2,
              }}
            >
              📍 {item.location}
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
                backgroundColor: scoreColor,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.white,
                }}
              >
                {item.score}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Điểm
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
            {item.appliedDate}
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
                >
                  {item.email}
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
                >
                  {item.phone}
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
                Kinh nghiệm: {item.experience}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                }}
              >
                Công việc: {item.jobApplied}
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

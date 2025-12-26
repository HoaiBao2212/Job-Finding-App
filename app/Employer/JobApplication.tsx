import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

interface JobPosting {
  id: string;
  title: string;
  company?: string;
  company_id?: number;
  companies?: {
    id: number;
    name: string;
  };
  location: string;
  salary?: string;
  applications?: number;
  views?: number;
  view_count?: number;
  is_active?: boolean | null;
  status?: "active" | "closed" | "draft";
  createdDate?: string;
  created_at?: string;
  deadline?: string;
  level?: "entry" | "mid" | "senior";
  experience_level?: string;
  applicantsCv?: number;
  description?: string;
}

export default function JobApplicationScreen() {
  return (
    <EmployerSidebarLayout>
      <JobApplicationContent />
    </EmployerSidebarLayout>
  );
}

function JobApplicationContent() {
  const router = useRouter();
  const { toggleSidebar, isOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "closed" | "draft"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "applications">(
    "newest"
  );
  const [loading, setLoading] = useState(true);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<
    Array<{ text: string; onPress?: () => void }>
  >([]);

  // Helper function để show alert
  const showAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void }>
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(
      buttons || [{ text: "OK", onPress: () => setAlertVisible(false) }]
    );
    setAlertVisible(true);
  };

  const handlePostJob = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Kiểm tra hồ sơ công ty
      const employer = await employerService.getEmployerProfile(user.id);
      if (!employer?.id) {
        showAlert(
          "Tạo hồ sơ doanh nghiệp",
          "Bạn chưa tạo hồ sơ doanh nghiệp. Vui lòng tạo hồ sơ để có thể đăng tin tuyển dụng"
        );
        return;
      }

      // Kiểm tra hồ sơ người dùng
      if (!user?.email) {
        showAlert(
          "Hoàn thiện hồ sơ",
          "Vui lòng hoàn thiện thông tin cá nhân trước khi đăng tin tuyển dụng"
        );
        return;
      }

      // Nếu hợp lệ, chuyển đến trang đăng tin
      router.push("/Employer/JobPosting");
    } catch (error) {
      console.error("Error checking profile:", error);
      showAlert("Lỗi", "Có lỗi khi kiểm tra hồ sơ");
    }
  };

  const handleDeleteJob = (jobId: string | number) => {
    showAlert(
      "Xóa công việc",
      "Bạn có chắc muốn xóa công việc này? Hành động này không thể hoàn tác.",
      [
        {
          text: "Xóa",
          onPress: () => {
            setAlertVisible(false);
            deleteJobConfirmed(jobId);
          },
        },
        {
          text: "Hủy",
          onPress: () => setAlertVisible(false),
        },
      ]
    );
  };

  const deleteJobConfirmed = async (jobId: string | number) => {
    try {
      const jobIdNum = typeof jobId === "string" ? parseInt(jobId) : jobId;
      await jobService.deleteJob(jobIdNum);
      // Cập nhật danh sách công việc
      setJobPostings(jobPostings.filter((job) => job.id !== jobIdNum));
      showAlert("Thành công", "Xóa công việc thành công", [
        {
          text: "OK",
          onPress: () => setAlertVisible(false),
        },
      ]);
    } catch (error) {
      console.error("Error deleting job:", error);
      showAlert("Lỗi", "Không thể xóa công việc");
    }
  };

  const handleCloseJob = (jobId: string | number) => {
    showAlert(
      "Đóng ứng tuyển",
      "Bạn có chắc muốn đóng công việc này? Ứng viên không thể ứng tuyển vào công việc này nữa.",
      [
        {
          text: "Đóng",
          onPress: () => {
            setAlertVisible(false);
            closeJobConfirmed(jobId);
          },
        },
        {
          text: "Hủy",
          onPress: () => setAlertVisible(false),
        },
      ]
    );
  };

  const closeJobConfirmed = async (jobId: string | number) => {
    try {
      const jobIdNum = typeof jobId === "string" ? parseInt(jobId) : jobId;
      await jobService.updateJob(jobIdNum, { is_active: false });
      // Cập nhật danh sách công việc
      setJobPostings(
        jobPostings.map((job) =>
          job.id === jobIdNum ? { ...job, is_active: false } : job
        )
      );
      showAlert("Thành công", "Công việc đã được đóng", [
        {
          text: "OK",
          onPress: () => setAlertVisible(false),
        },
      ]);
    } catch (error) {
      console.error("Error closing job:", error);
      showAlert("Lỗi", "Không thể đóng công việc");
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
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
        const jobs = await jobService.getEmployerJobs(employer.id);

        // Fetch application count for each job
        const jobsWithApplicationCount = await Promise.all(
          jobs.map(async (job) => {
            try {
              const applications = await jobService.getApplications(job.id);
              return {
                ...job,
                applications: applications.length,
              };
            } catch (error) {
              console.error(
                `Error fetching applications for job ${job.id}:`,
                error
              );
              return job;
            }
          })
        );

        setJobPostings(jobsWithApplicationCount);
      } else {
        // Nếu người dùng chưa có employer, hiển thị alert
        showAlert(
          "Tạo hồ sơ doanh nghiệp",
          "Bạn chưa tạo hồ sơ doanh nghiệp. Vui lòng tạo hồ sơ để có thể đăng tin tuyển dụng",
          [
            {
              text: "Hủy",
              onPress: () => {
                setAlertVisible(false);
                router.back();
              },
            },
            {
              text: "OK",
              onPress: () => {
                setAlertVisible(false);
                router.replace("/Employer/Companies");
              },
            },
          ]
        );
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean | null) => {
    if (isActive === true) {
      return { bg: "#F6FFED", text: "#52C41A", label: "Đang tuyển" };
    } else if (isActive === false) {
      return { bg: "#FFF1F0", text: "#FF7875", label: "Đã đóng" };
    } else {
      return { bg: "#F5F5F5", text: "#8C8C8C", label: "Nháp" };
    }
  };

  const getLevelLabel = (level: string | undefined) => {
    switch (level) {
      case "entry":
        return "Người mới";
      case "mid":
        return "Trung cấp";
      case "senior":
        return "Cao cấp";
      default:
        return "Khác";
    }
  };

  const filteredJobs = jobPostings
    .filter((job) => {
      const matchesSearch =
        (job.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || job.is_active === (filterStatus === "active");
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (parseInt(b.id as any) || 0) - (parseInt(a.id as any) || 0);
      } else if (sortBy === "popular") {
        return (b.view_count || 0) - (a.view_count || 0);
      } else if (sortBy === "applications") {
        return (b.applications || 0) - (a.applications || 0);
      }
      return 0;
    });

  const statistics = {
    total: jobPostings.length,
    active: jobPostings.filter((j) => j.is_active === true).length,
    closed: jobPostings.filter((j) => j.is_active === false).length,
    draft: jobPostings.filter((j) => j.is_active === null).length,
    totalApplications: jobPostings.reduce(
      (sum, j) => sum + (j.applications || 0),
      0
    ),
    totalViews: jobPostings.reduce((sum, j) => sum + (j.view_count || 0), 0),
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: colors.textDark,
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: colors.textGray,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return { bg: "#E7F5FF", text: colors.primary, label: "Mới ứng tuyển" };
      case "reviewing":
        return { bg: "#FFF7E6", text: "#FF7A45", label: "Đang xem xét" };
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

  const JobCard = ({ item }: { item: JobPosting }) => {
    const statusInfo = getStatusColor(item.is_active as any);
    return (
      <TouchableOpacity
        onPress={() => router.push(`/Employer/CandidateApply?jobId=${item.id}`)}
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
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 4,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginBottom: 6,
              }}
            >
              {item.companies?.name || item.company || "Công ty"} •{" "}
              {item.location || "Địa điểm"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
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
                {item.applications || 0} ứng tuyển
              </Text>
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
                  Tin tuyển dụng
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "500",
                  }}
                >
                  Quản lý các tin đăng của bạn
                </Text>
              </View>
            </View>
          </View>

          {/* Add Button */}
          <View
            style={{
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={handlePostJob}
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Đăng tin tuyển dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 0,
            marginBottom: 0,
          }}
        ></View>

        {/* Search and Filters */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 12,
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
              placeholder="Tìm tin tuyển dụng..."
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

          {/* Sort */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textGray }}>
              Sắp xếp:
            </Text>
            {(["newest", "popular", "applications"] as const).map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() => setSortBy(sort)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    sortBy === sort ? colors.primary : colors.white,
                  borderWidth: 1,
                  borderColor:
                    sortBy === sort ? colors.primary : colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: sortBy === sort ? colors.white : colors.textDark,
                  }}
                >
                  {sort === "newest"
                    ? "Mới"
                    : sort === "popular"
                    ? "Phổ biến"
                    : "Ứng tuyển"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job List */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
        >
          {filteredJobs.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textGray,
                  marginBottom: 12,
                }}
              >
                Tìm thấy {filteredJobs.length} tin tuyển dụng
              </Text>
              {filteredJobs.map((job) => (
                <JobCard key={job.id} item={job} />
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
                name="briefcase-search"
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
                Không tìm thấy tin tuyển dụng
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

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

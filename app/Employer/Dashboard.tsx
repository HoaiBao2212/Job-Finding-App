import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
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

interface StatCard {
  id: string;
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface JobPosting {
  id: string;
  title: string;
  applications: number;
  views: number;
  status: "active" | "closed" | "draft";
  postedDate: string;
  applicantsCv: number;
}

interface RecentApplication {
  id: string;
  applicationId?: number;
  name: string;
  position: string;
  avatar: string;
  appliedDate: string;
  status: "new" | "reviewing" | "accepted" | "rejected";
}

export default function ApplicantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "postings" | "applications"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalApplied: 0,
    totalViews: 0,
  });
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);

  return (
    <EmployerSidebarLayout>
      <DashboardContent />
    </EmployerSidebarLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { toggleSidebar, isOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalApplied: 0,
    totalViews: 0,
  });
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"postings" | "applications">(
    "postings"
  );
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [applicationSearch, setApplicationSearch] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
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
      const profile = await authService.getCurrentUser();
      if (!profile?.email) {
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

        // Lấy thống kê công việc
        const jobStats = await employerService.getJobStats(employer.id);
        setStats(jobStats);

        // Lấy danh sách công việc
        const jobs = await jobService.getEmployerJobs(employer.id);

        // Lấy số lượng ứng tuyển cho mỗi công việc
        const jobsWithApplications = await Promise.all(
          jobs.map(async (job) => {
            const applications = await jobService.getApplications(job.id);
            return {
              ...job,
              applicationsCount: applications?.length || 0,
            };
          })
        );

        setJobPostings(jobsWithApplications); // Lưu tất cả công việc

        // Lấy danh sách ứng viên ứng tuyển gần đây
        const recent = await jobService.getRecentApplications(employer.id, 5);
        setRecentApplications(recent);

        // Lấy tất cả ứng viên ứng tuyển
        const all = await jobService.getAllApplications(employer.id);
        setAllApplications(all);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultStats: StatCard[] = [
    {
      id: "1",
      icon: "briefcase",
      label: "Tin tuyển dụng",
      value: stats.total,
      color: colors.primary,
      bgColor: "#E7F5FF",
    },
    {
      id: "2",
      icon: "file-document",
      label: "Hồ sơ nhận được",
      value: stats.totalApplied,
      color: "#52C41A",
      bgColor: "#F6FFED",
    },
    {
      id: "3",
      icon: "eye",
      label: "Lượt xem",
      value: stats.totalViews,
      color: "#FF7A45",
      bgColor: "#FFF7E6",
    },
    {
      id: "4",
      icon: "trending-up",
      label: "Tỷ lệ ứng tuyển",
      value:
        stats.total > 0
          ? Math.round((stats.totalApplied / stats.total) * 100)
          : 0,
      color: "#722ED1",
      bgColor: "#F9F0FF",
    },
  ];

  // Hàm format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Dữ liệu giả để hiển thị khi không có dữ liệu từ API
  const displayJobPostings: JobPosting[] = jobPostings.map((job) => ({
    id: job.id?.toString() || "",
    title: job.title || "",
    applications: job.applicationsCount || 0,
    views: job.view_count || 0,
    status: job.is_active ? "active" : "closed",
    postedDate: job.created_at ? formatDate(job.created_at) : "",
    applicantsCv: job.applicationsCount || 0,
  }));

  const displayJobPostingsDefault: JobPosting[] = [
    {
      id: "1",
      title: "React Native Developer",
      applications: 24,
      views: 320,
      status: "active",
      postedDate: "5 ngày trước",
      applicantsCv: 18,
    },
    {
      id: "2",
      title: "UI/UX Designer",
      applications: 16,
      views: 280,
      status: "active",
      postedDate: "12 ngày trước",
      applicantsCv: 12,
    },
    {
      id: "3",
      title: "Backend Developer",
      applications: 8,
      views: 185,
      status: "closed",
      postedDate: "30 ngày trước",
      applicantsCv: 7,
    },
  ];

  // Chuyển đổi dữ liệu từ API sang format hiển thị
  const displayRecentApps: RecentApplication[] =
    recentApplications && recentApplications.length > 0
      ? recentApplications.map((app: any) => ({
          id: app.id?.toString() || "",
          applicationId: app.id,
          name: app.candidate_profiles?.user?.full_name || "Ứng viên",
          position: app.jobs?.title || "",
          avatar:
            app.candidate_profiles?.user?.avatar_url ||
            "https://i.pravatar.cc/150?img=default",
          appliedDate: formatDate(app.applied_at),
          status: (app.status === "pending" || app.status === "applied"
            ? "new"
            : app.status) as any,
        }))
      : [
          {
            id: "1",
            name: "Nguyễn Văn A",
            position: "React Native Developer",
            avatar: "https://i.pravatar.cc/150?img=1",
            appliedDate: "Hôm nay",
            status: "new",
          },
          {
            id: "2",
            name: "Trần Thị B",
            position: "UI/UX Designer",
            avatar: "https://i.pravatar.cc/150?img=2",
            appliedDate: "Hôm qua",
            status: "reviewing",
          },
          {
            id: "3",
            name: "Lê Văn C",
            position: "React Native Developer",
            avatar: "https://i.pravatar.cc/150?img=3",
            appliedDate: "2 ngày trước",
            status: "accepted",
          },
        ];

  // Hiển thị tất cả ứng viên ứng tuyển
  const displayAllApps: RecentApplication[] =
    allApplications && allApplications.length > 0
      ? allApplications.map((app: any) => ({
          id: app.id?.toString() || "",
          applicationId: app.id,
          name: app.candidate_profiles?.user?.full_name || "Ứng viên",
          position: app.jobs?.title || "",
          avatar:
            app.candidate_profiles?.user?.avatar_url ||
            "https://i.pravatar.cc/150?img=default",
          appliedDate: formatDate(app.applied_at),
          status: (app.status === "pending" || app.status === "applied"
            ? "new"
            : app.status) as any,
        }))
      : [];

  // Filter applications by search query
  const filteredApplications: RecentApplication[] = displayAllApps.filter(
    (app) =>
      app.name.toLowerCase().includes(applicationSearch.toLowerCase()) ||
      app.position.toLowerCase().includes(applicationSearch.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "#F6FFED", text: "#52C41A", label: "Đang tuyển" };
      case "closed":
        return { bg: "#FFF1F0", text: "#FF7875", label: "Đã đóng" };
      case "draft":
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Nháp" };
      case "new":
        return { bg: "#E7F5FF", text: colors.primary, label: "Mới" };
      case "reviewing":
        return { bg: "#FFF7E6", text: "#FF7A45", label: "Đang xem" };
      case "accepted":
        return { bg: "#F6FFED", text: "#52C41A", label: "Chấp nhận" };
      case "rejected":
        return { bg: "#FFF1F0", text: "#FF7875", label: "Từ chối" };
      default:
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Khác" };
    }
  };

  const StatCard = ({ item }: { item: StatCard }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: item.bgColor,
        borderRadius: 12,
        padding: 16,
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={24}
        color={item.color}
        style={{ marginBottom: 8 }}
      />
      <Text style={{ fontSize: 20, fontWeight: "700", color: item.color }}>
        {item.value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textGray,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const JobPostingCard = ({ item }: { item: JobPosting }) => {
    const statusInfo = getStatusColor(item.status);
    return (
      <TouchableOpacity
        onPress={() => router.push(`/Employer/JobDetail?jobId=${item.id}`)}
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
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.textDark,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginTop: 4,
              }}
            >
              Đăng {item.postedDate}
            </Text>
          </View>
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
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#52C41A"
              style={{ marginBottom: 4 }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textDark,
              }}
            >
              {item.applications}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textGray }}>
              Ứng tuyển
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons
              name="eye"
              size={16}
              color="#FF7A45"
              style={{ marginBottom: 4 }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textDark,
              }}
            >
              {item.views}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textGray }}>
              Lượt xem
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ApplicationCard = ({ item }: { item: RecentApplication }) => {
    const statusInfo = getStatusColor(item.status);
    return (
      <TouchableOpacity
        onPress={() =>
          item.applicationId &&
          router.push(
            `/Employer/CandidateApplicantDetail?applicationId=${item.applicationId}`
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
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <Image
              source={{ uri: item.avatar }}
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
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginBottom: 6,
                }}
              >
                {item.position}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
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
                  {item.appliedDate}
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
    <EmployerSidebarLayout>
      <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header - Modern Design */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 36,
              paddingBottom: 24,
            }}
          >
            {/* Top Row - Welcome & Bell */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight: "800",
                      color: colors.white,
                      marginBottom: 4,
                    }}
                  >
                    Chào mừng! 👋
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "500",
                    }}
                  >
                    Hôm nay bạn sẽ làm gì?
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Quick View - Horizontal Scroll */}
            <View style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "600",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Tổng quan nhanh
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.white,
                      marginBottom: 2,
                    }}
                  >
                    {stats.total}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "500",
                    }}
                  >
                    Tin tuyển
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.white,
                      marginBottom: 2,
                    }}
                  >
                    {stats.totalApplied}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "500",
                    }}
                  >
                    Ứng tuyển
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.white,
                      marginBottom: 2,
                    }}
                  >
                    {stats.totalViews}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "500",
                    }}
                  >
                    Lượt xem
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Stats Cards */}
          <View
            style={{ paddingHorizontal: 16, marginTop: 0, marginBottom: 0 }}
          ></View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              marginBottom: 12,
              marginTop: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            {(["postings", "applications"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderBottomWidth: activeTab === tab ? 3 : 0,
                  borderBottomColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: activeTab === tab ? "700" : "500",
                    color: activeTab === tab ? colors.primary : colors.textGray,
                  }}
                >
                  {tab === "postings" ? "Tin tuyển" : "Ứng tuyển"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {activeTab === "postings" && (
              <View>
                {/* Quick Actions */}
                <View
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <TouchableOpacity
                    onPress={handlePostJob}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={colors.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      Đăng tin tuyển dụng
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    marginBottom: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.textDark,
                    }}
                  >
                    Tin tuyển dụng của bạn
                  </Text>
                </View>
                {displayJobPostings.map((job) => (
                  <JobPostingCard key={job.id} item={job} />
                ))}
              </View>
            )}

            {activeTab === "applications" && (
              <View>
                {/* Search Bar */}
                <View
                  style={{
                    marginBottom: 16,
                    backgroundColor: colors.white,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="magnify"
                    size={18}
                    color={colors.textGray}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Tìm ứng viên hoặc vị trí..."
                    placeholderTextColor={colors.textGray}
                    value={applicationSearch}
                    onChangeText={setApplicationSearch}
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: colors.textDark,
                      paddingVertical: 4,
                    }}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginBottom: 12,
                  }}
                >
                  Tất cả ứng tuyển ({filteredApplications.length})
                </Text>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <ApplicationCard key={app.id} item={app} />
                  ))
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 32,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="inbox-outline"
                      size={48}
                      color={colors.textGray}
                      style={{ marginBottom: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textGray,
                        fontWeight: "600",
                      }}
                    >
                      Không có ứng tuyển
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginTop: 4,
                      }}
                    >
                      Hãy thử tìm kiếm với từ khóa khác
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Alert Modal */}
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
      </View>
    </EmployerSidebarLayout>
  );
}

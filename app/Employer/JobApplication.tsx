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
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  applications: number;
  views: number;
  status: "active" | "closed" | "draft";
  createdDate: string;
  deadline: string;
  level: "entry" | "mid" | "senior";
  applicantsCv: number;
  description: string;
}

export default function JobApplicationScreen() {
  const router = useRouter();
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
        setJobPostings(jobs);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "#F6FFED", text: "#52C41A", label: "Đang tuyển" };
      case "closed":
        return { bg: "#FFF1F0", text: "#FF7875", label: "Đã đóng" };
      case "draft":
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Nháp" };
      default:
        return { bg: "#F5F5F5", text: "#8C8C8C", label: "Khác" };
    }
  };

  const getLevelLabel = (level: string) => {
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
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || job.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return parseInt(b.id) - parseInt(a.id);
      } else if (sortBy === "popular") {
        return b.views - a.views;
      } else if (sortBy === "applications") {
        return b.applications - a.applications;
      }
      return 0;
    });

  const statistics = {
    total: jobPostings.length,
    active: jobPostings.filter((j) => j.status === "active").length,
    closed: jobPostings.filter((j) => j.status === "closed").length,
    draft: jobPostings.filter((j) => j.status === "draft").length,
    totalApplications: jobPostings.reduce((sum, j) => sum + j.applications, 0),
    totalViews: jobPostings.reduce((sum, j) => sum + j.views, 0),
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

  const JobCard = ({ item }: { item: JobPosting }) => {
    const statusInfo = getStatusColor(item.status);
    return (
      <TouchableOpacity
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
                fontSize: 14,
                fontWeight: "700",
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
              {item.company} • {item.location}
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

        {/* Salary and Level */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>
              Mức lương
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.primary,
                marginTop: 4,
              }}
            >
              {item.salary}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>Cấp độ</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {getLevelLabel(item.level)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>
              Hạn chót
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.deadline}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons
              name="file-document"
              size={16}
              color={colors.primary}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.applicantsCv}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              CV
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#52C41A"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.applications}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Ứng tuyển
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons name="eye" size={16} color="#FF7A45" />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.views}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Lượt xem
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/Employer/JobDetail",
              })
            }
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
              Xem chi tiết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="delete" size={16} color="#FF7875" />
          </TouchableOpacity>
        </View>
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
                marginBottom: 0,
              }}
            >
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    marginRight: 12,
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={28}
                    color={colors.white}
                  />
                </TouchableOpacity>
                <View>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: colors.white,
                    }}
                  >
                    Tin tuyển dụng
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "500",
                      marginTop: 2,
                    }}
                  >
                    Quản lý các tin đăng của bạn
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/Employer/JobPosting" as any)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={colors.white}
                />
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

            {/* Filter Tabs */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 12,
              }}
            >
              {(["all", "active", "closed", "draft"] as const).map((status) => (
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
                      : status === "active"
                      ? "Đang tuyển"
                      : status === "closed"
                      ? "Đã đóng"
                      : "Nháp"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textGray }}>
                Sắp xếp:
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["newest", "popular", "applications"] as const).map(
                  (sort) => (
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
                          color:
                            sortBy === sort ? colors.white : colors.textDark,
                        }}
                      >
                        {sort === "newest"
                          ? "Mới"
                          : sort === "popular"
                          ? "Phổ biến"
                          : "Ứng tuyển"}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
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
      </SafeAreaView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onDismiss={() => {
          setAlertVisible(false);
          router.back();
        }}
      />
    </EmployerSidebarLayout>
  );
}

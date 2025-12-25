import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { supabase } from "../../lib/supabase";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout, {
  useSidebar,
} from "../Component/EmployerSidebarLayout";

interface InterviewApplication {
  id: number;
  job_id: number;
  candidate_id: number;
  applied_at: string;
  status: string;
  interview_id: number | null;
  job_title: string;
  candidate_name: string;
  candidate_avatar: string;
  candidate_email: string;
}

export default function InterviewSchedulingScreen() {
  return (
    <EmployerSidebarLayout>
      <InterviewSchedulingContent />
    </EmployerSidebarLayout>
  );
}

function InterviewSchedulingContent() {
  const router = useRouter();
  const { toggleSidebar, isOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<InterviewApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    InterviewApplication[]
  >([]);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(
    new Set()
  );
  const [jobFilter, setJobFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uniqueJobs, setUniqueJobs] = useState<
    Array<{ id: number; title: string }>
  >([]);

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
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (employerError) throw employerError;
      if (!employers) {
        showAlert("Error", "Employer profile not found");
        return;
      }

      setEmployerId(employers.id);

      // Get all jobs for this employer
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("created_by_employer_id", employers.id);

      if (jobsError) throw jobsError;

      const jobIds = jobs?.map((j) => j.id) || [];
      setUniqueJobs(jobs || []);

      if (jobIds.length === 0) {
        setApplications([]);
        setFilteredApplications([]);
        return;
      }

      // Get applications where status = 'interview' (regardless of interview_id)
      const { data: appData, error: appError } = await supabase
        .from("job_applications")
        .select(
          `
          id,
          job_id,
          candidate_id,
          applied_at,
          status,
          interview_id,
          jobs(title),
          candidate_profiles(
            user:profiles(
              full_name,
              avatar_url,
              email
            )
          )
        `
        )
        .in("job_id", jobIds)
        .eq("status", "interview")
        .order("applied_at", { ascending: false });

      if (appError) throw appError;

      console.log(
        "Total applications with status 'interview':",
        appData?.length
      );

      // Format all applications with status 'interview' (including those already scheduled)
      const formattedApps: InterviewApplication[] = (appData || []).map(
        (app: any) => ({
          id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id,
          applied_at: app.applied_at,
          status: app.status,
          interview_id: app.interview_id,
          job_title: app.jobs?.title || "Unknown Job",
          candidate_name: app.candidate_profiles?.user?.full_name || "Unknown",
          candidate_avatar: app.candidate_profiles?.user?.avatar_url || "",
          candidate_email: app.candidate_profiles?.user?.email || "",
        })
      );

      setApplications(formattedApps);
      setFilteredApplications(formattedApps);
      // Reset selection when data refreshes
      setSelectedApplications(new Set());
    } catch (error) {
      console.error("Error loading interview applications:", error);
      showAlert("Error", "Failed to load interview applications");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (jobFilter) {
      filtered = filtered.filter((app) => app.job_id === parseInt(jobFilter));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.candidate_name.toLowerCase().includes(query) ||
          app.candidate_email.toLowerCase().includes(query) ||
          app.job_title.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [jobFilter, searchQuery, applications]);

  const toggleApplicationSelection = (applicationId: number) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(
        new Set(filteredApplications.map((app) => app.id))
      );
    }
  };

  const handleScheduleInterview = () => {
    if (selectedApplications.size === 0) {
      showAlert("No Selection", "Please select at least one candidate");
      return;
    }

    // Pass selected applications to the interview scheduling detail screen
    const selectedApps = Array.from(selectedApplications);
    router.push({
      pathname: "/Employer/ScheduleInterviewDetail",
      params: {
        applicationIds: JSON.stringify(selectedApps),
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const ApplicationCard = ({
    item,
    isSelected,
  }: {
    item: InterviewApplication;
    isSelected: boolean;
  }) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 2,
          borderColor: isSelected ? colors.primary : colors.borderLight,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
        onPress={() => toggleApplicationSelection(item.id)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => toggleApplicationSelection(item.id)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: isSelected ? colors.primary : colors.borderLight,
              backgroundColor: isSelected ? colors.primary : colors.white,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            {isSelected && (
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={colors.white}
              />
            )}
          </TouchableOpacity>

          {/* Candidate Info */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Image
                source={{
                  uri:
                    item.candidate_avatar || "https://via.placeholder.com/40",
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: colors.borderLight,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.textDark,
                    marginBottom: 2,
                  }}
                >
                  {item.candidate_name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                  }}
                >
                  {item.candidate_email}
                </Text>
              </View>
            </View>

            {/* Job Title */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={14}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                }}
              >
                {item.job_title}
              </Text>
            </View>

            {/* Applied Date and Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={14}
                  color={colors.textGray}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                  }}
                >
                  Applied {formatDate(item.applied_at)}
                </Text>
              </View>

              {/* Interview Stage Badge */}
              <View
                style={{
                  backgroundColor: item.interview_id ? "#E6F7FF" : "#FFF4E6",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: item.interview_id ? colors.primary : "#FF7A45",
                  }}
                >
                  {item.interview_id ? "Đã xếp lịch" : "Chờ xếp lịch"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bgNeutral,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingTop: 35,
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
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={toggleSidebar}
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
                name="menu"
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
                Xếp lịch phỏng vấn
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Quản lý lịch phỏng vấn ứng viên
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search and Filter Section */}
      <View
        style={{
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgNeutral,
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.textGray}
          />
          <TextInput
            placeholder="Tìm ứng viên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 8,
              fontSize: 14,
              color: colors.textDark,
            }}
            placeholderTextColor={colors.textGray}
          />
        </View>

        {/* Job Filter Label and Tags */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: colors.textGray,
            marginBottom: 8,
          }}
        >
          Lọc theo công việc:
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Job Filter */}
          <TouchableOpacity
            onPress={() => setJobFilter("")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: jobFilter === "" ? colors.primary : colors.white,
              borderWidth: 1,
              borderColor:
                jobFilter === "" ? colors.primary : colors.borderLight,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: jobFilter === "" ? colors.white : colors.textDark,
              }}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {uniqueJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => setJobFilter(String(job.id))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor:
                  jobFilter === String(job.id) ? colors.primary : colors.white,
                borderWidth: 1,
                borderColor:
                  jobFilter === String(job.id)
                    ? colors.primary
                    : colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color:
                    jobFilter === String(job.id)
                      ? colors.white
                      : colors.textDark,
                }}
                numberOfLines={1}
              >
                {job.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredApplications.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <MaterialCommunityIcons
            name="inbox-multiple-outline"
            size={48}
            color={colors.textGray}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.textDark,
              marginBottom: 8,
            }}
          >
            No Candidates Waiting for Interview
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textGray,
              textAlign: "center",
            }}
          >
            {applications.length === 0
              ? "All candidates have been scheduled for interviews"
              : "Try adjusting your filters"}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 12,
          }}
        >
          {/* Select All Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              marginBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor:
                    selectedApplications.size === filteredApplications.length &&
                    filteredApplications.length > 0
                      ? colors.primary
                      : colors.borderLight,
                  backgroundColor:
                    selectedApplications.size === filteredApplications.length &&
                    filteredApplications.length > 0
                      ? colors.primary
                      : colors.white,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                {selectedApplications.size === filteredApplications.length &&
                  filteredApplications.length > 0 && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={colors.white}
                    />
                  )}
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textDark,
                }}
              >
                Select All
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 13,
                color: colors.textGray,
              }}
            >
              {selectedApplications.size} selected
            </Text>
          </View>

          {/* Applications List */}
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              item={app}
              isSelected={selectedApplications.has(app.id)}
            />
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Action Button */}
      {filteredApplications.length > 0 && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}
        >
          <TouchableOpacity
            onPress={handleScheduleInterview}
            disabled={selectedApplications.size === 0}
            style={{
              backgroundColor:
                selectedApplications.size > 0
                  ? colors.primary
                  : colors.textGray,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              opacity: selectedApplications.size > 0 ? 1 : 0.5,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.white,
              }}
            >
              Schedule Interview ({selectedApplications.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    </SafeAreaView>
  );
}

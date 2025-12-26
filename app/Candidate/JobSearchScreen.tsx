import { theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";
import SidebarLayout, { useSidebar } from "../Component/SidebarLayout";
type Job = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  type: "Toàn thời gian" | "Bán thời gian" | "Thực tập" | "Remote";
  job_type?: string;
  postedTime: string;
  created_at?: string;
  tags: string[];
  view_count?: number;
};

const getJobTypeDisplay = (jobType: string | null | undefined): Job["type"] => {
  const typeMap: Record<string, Job["type"]> = {
    "full-time": "Toàn thời gian",
    "part-time": "Bán thời gian",
    internship: "Thực tập",
    remote: "Remote",
  };
  return typeMap[jobType?.toLowerCase() || ""] || "Toàn thời gian";
};

const getJobTypeKey = (displayType: Job["type"]): string => {
  const typeMap: Record<Job["type"], string> = {
    "Toàn thời gian": "full-time",
    "Bán thời gian": "part-time",
    "Thực tập": "internship",
    Remote: "remote",
  };
  return typeMap[displayType];
};

const sortOptions = ["Mới nhất", "Lương cao nhất", "Phù hợp nhất"];

export default function JobSearchScreenWrapper() {
  return (
    <SidebarLayout>
      <JobSearchScreen />
    </SidebarLayout>
  );
}

const JobSearchScreen: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  const [keyword, setKeyword] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<Job["type"] | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string>("Tất cả");
  const [selectedCompany, setSelectedCompany] = useState<string>("Tất cả");
  const [selectedSort, setSelectedSort] = useState<string>("Mới nhất");
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<string[]>(["Tất cả"]);
  const [companies, setCompanies] = useState<string[]>(["Tất cả"]);
  const [jobTypes, setJobTypes] = useState<Job["type"][]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState(false);
  const [expandedJobType, setExpandedJobType] = useState(false);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<
    string | null
  >(null);
  const [expandedExperienceLevel, setExpandedExperienceLevel] = useState(false);
  const [salary, setSalary] = useState<string>("");

  const experienceLevelOptions = ["junior", "mid", "senior"];

  // Fetch jobs from Supabase
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("jobs")
          .select(
            `
            id,
            title,
            location,
            salary_min,
            salary_max,
            salary_currency,
            job_type,
            experience_level,
            view_count,
            created_at,
            companies(name)
          `
          )
          .eq("is_active", true);

        if (error) throw error;

        // Transform data
        const jobsData = (data || []).map((job: any) => {
          const salary =
            job.salary_min && job.salary_max
              ? `${job.salary_min} - ${job.salary_max} ${
                  job.salary_currency || "VND"
                }`
              : undefined;

          return {
            id: job.id,
            title: job.title,
            company: job.companies?.name || "Công ty",
            location: job.location || "Không xác định",
            salaryRange: salary,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            salary_currency: job.salary_currency,
            type: getJobTypeDisplay(job.job_type),
            job_type: job.job_type,
            experience_level: job.experience_level,
            view_count: job.view_count,
            postedTime: formatPostedTime(job.created_at),
            created_at: job.created_at,
            tags: [],
          };
        });

        setAllJobs(jobsData);

        // Extract unique locations
        const uniqueLocations = [
          "Tất cả",
          ...new Set(jobsData.map((j) => j.location)),
        ];
        setLocations(uniqueLocations as string[]);

        // Extract unique companies
        const uniqueCompanies = [
          "Tất cả",
          ...new Set(jobsData.map((j) => j.company)),
        ];
        setCompanies(uniqueCompanies as string[]);

        // Extract unique job types
        const uniqueJobTypes = [...new Set(jobsData.map((j) => j.type))].filter(
          (type) => type !== undefined
        ) as Job["type"][];
        setJobTypes(uniqueJobTypes);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setAllJobs([]);
        setLocations(["Tất cả"]);
        setJobTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const formatPostedTime = (createdAt: string | undefined): string => {
    if (!createdAt) return "Gần đây";

    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const incrementJobView = async (jobId: string | number) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("view_count")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      const currentCount = data?.view_count || 0;

      const { error: updateError } = await supabase
        .from("jobs")
        .update({ view_count: currentCount + 1 })
        .eq("id", jobId);

      if (updateError) throw updateError;

      // Update local state
      setAllJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, view_count: (job.view_count || 0) + 1 }
            : job
        )
      );
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const filteredJobs = allJobs.filter((job: any) => {
    const matchKeyword =
      keyword.trim().length === 0 ||
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.company.toLowerCase().includes(keyword.toLowerCase());

    const matchJobType = !selectedJobType || job.type === selectedJobType;

    const matchLocation =
      selectedLocation === "Tất cả" || job.location === selectedLocation;

    const matchCompany =
      selectedCompany === "Tất cả" || job.company === selectedCompany;

    const matchExperienceLevel =
      !selectedExperienceLevel ||
      job.experience_level === selectedExperienceLevel;

    // Check if salary is within job's salary range
    let matchSalary = true;
    if (salary.trim() !== "") {
      const salaryInput = parseInt(salary);
      if (!isNaN(salaryInput) && job.salary_min && job.salary_max) {
        matchSalary =
          salaryInput >= job.salary_min && salaryInput <= job.salary_max;
      } else if (!isNaN(salaryInput)) {
        matchSalary = false;
      }
    }

    return (
      matchKeyword &&
      matchJobType &&
      matchLocation &&
      matchCompany &&
      matchExperienceLevel &&
      matchSalary
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
              name="briefcase"
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
              New job today
            </Text>
          </View>

          {/* Notification Button - Right Side */}
          <TouchableOpacity
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
              name="bell"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* Thanh tìm kiếm */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.text.subtle}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập công việc, công ty, địa điểm..."
              placeholderTextColor={theme.text.subtle}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Kết quả */}
        <Text style={styles.resultCount}>
          {filteredJobs.length} công việc phù hợp
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.jobList}
        >
          {filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              activeOpacity={0.9}
              onPress={() => {
                router.push({
                  pathname: `/Candidate/JobDetail`,
                  params: { id: job.id.toString() },
                } as any);
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.textDark,
                      marginBottom: 4,
                      fontFamily: "sans-serif",
                    }}
                  >
                    {job.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      marginBottom: 8,
                      fontFamily: "sans-serif",
                    }}
                  >
                    {job.company}
                  </Text>
                </View>
                {job.view_count && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.primarySoftBg,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="eye"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        marginLeft: 4,
                        color: colors.textDark,
                        fontWeight: "500",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {job.view_count}
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginLeft: 4,
                      marginRight: 16,
                      fontFamily: "sans-serif",
                    }}
                  >
                    {job.location}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.primary,
                    fontFamily: "sans-serif",
                  }}
                >
                  {job.salaryRange || "Thương lượng"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredJobs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-circle-outline"
                size={64}
                color={theme.text.subtle}
              />
              <Text style={styles.emptyTitle}>
                Không tìm thấy công việc phù hợp
              </Text>
              <Text style={styles.emptySubtitle}>
                Hãy thử thay đổi từ khóa hoặc bộ lọc để xem thêm cơ hội khác.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={theme.text.heading}
                />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <ScrollView style={styles.modalBody}>
              {/* Location Dropdown */}
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setExpandedLocation(!expandedLocation)}
                >
                  <View style={styles.dropdownHeaderContent}>
                    <Text style={styles.dropdownHeaderTitle}>Địa điểm</Text>
                    <Text style={styles.dropdownHeaderValue}>
                      {selectedLocation}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedLocation
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={20}
                    color={theme.text.subtle}
                  />
                </TouchableOpacity>

                {expandedLocation && (
                  <View style={styles.dropdownOptions}>
                    {locations.map((location) => (
                      <TouchableOpacity
                        key={location}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedLocation(location);
                          setExpandedLocation(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selectedLocation === location &&
                              styles.dropdownOptionTextActive,
                          ]}
                        >
                          {location}
                        </Text>
                        {selectedLocation === location && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Company Dropdown */}
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setExpandedCompany(!expandedCompany)}
                >
                  <View style={styles.dropdownHeaderContent}>
                    <Text style={styles.dropdownHeaderTitle}>Công ty</Text>
                    <Text style={styles.dropdownHeaderValue}>
                      {selectedCompany}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedCompany
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={20}
                    color={theme.text.subtle}
                  />
                </TouchableOpacity>

                {expandedCompany && (
                  <View style={styles.dropdownOptions}>
                    {companies.map((company) => (
                      <TouchableOpacity
                        key={company}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedCompany(company);
                          setExpandedCompany(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selectedCompany === company &&
                              styles.dropdownOptionTextActive,
                          ]}
                        >
                          {company}
                        </Text>
                        {selectedCompany === company && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Job Type Dropdown */}
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setExpandedJobType(!expandedJobType)}
                >
                  <View style={styles.dropdownHeaderContent}>
                    <Text style={styles.dropdownHeaderTitle}>
                      Loại công việc
                    </Text>
                    <Text style={styles.dropdownHeaderValue}>
                      {selectedJobType || "Tất cả"}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedJobType
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={20}
                    color={theme.text.subtle}
                  />
                </TouchableOpacity>

                {expandedJobType && (
                  <View style={styles.dropdownOptions}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedJobType(null);
                        setExpandedJobType(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          !selectedJobType && styles.dropdownOptionTextActive,
                        ]}
                      >
                        Tất cả
                      </Text>
                      {!selectedJobType && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                    {jobTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedJobType(type);
                          setExpandedJobType(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selectedJobType === type &&
                              styles.dropdownOptionTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                        {selectedJobType === type && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Experience Level Dropdown */}
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() =>
                    setExpandedExperienceLevel(!expandedExperienceLevel)
                  }
                >
                  <View style={styles.dropdownHeaderContent}>
                    <Text style={styles.dropdownHeaderTitle}>
                      Trình độ kinh nghiệm
                    </Text>
                    <Text style={styles.dropdownHeaderValue}>
                      {selectedExperienceLevel || "Tất cả"}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      expandedExperienceLevel
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={20}
                    color={theme.text.subtle}
                  />
                </TouchableOpacity>

                {expandedExperienceLevel && (
                  <View style={styles.dropdownOptions}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedExperienceLevel(null);
                        setExpandedExperienceLevel(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          !selectedExperienceLevel &&
                            styles.dropdownOptionTextActive,
                        ]}
                      >
                        Tất cả
                      </Text>
                      {!selectedExperienceLevel && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                    {experienceLevelOptions.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedExperienceLevel(level);
                          setExpandedExperienceLevel(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selectedExperienceLevel === level &&
                              styles.dropdownOptionTextActive,
                          ]}
                        >
                          {level === "junior"
                            ? "Thực tập sinh / Lập trình viên mới"
                            : level === "mid"
                            ? "Lập trình viên có kinh nghiệm"
                            : "Lập trình viên chuyên gia"}
                        </Text>
                        {selectedExperienceLevel === level && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Salary Input */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>
                  Mức lương mong muốn (VND)
                </Text>
                <TextInput
                  style={styles.salaryInput}
                  placeholder="Nhập mức lương..."
                  placeholderTextColor={theme.text.subtle}
                  keyboardType="numeric"
                  value={salary}
                  onChangeText={setSalary}
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedLocation("Tất cả");
                  setSelectedJobType(null);
                  setSelectedExperienceLevel(null);
                  setSalary("");
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyFilterButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.main,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // SEARCH
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.text.body,
  },
  filterButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // JOB TYPE BUTTONS
  jobTypeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  jobTypeButton: {
    flex: 1,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: theme.background.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  jobTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  jobTypeButtonText: {
    fontSize: 13,
    color: theme.text.subtle,
  },
  jobTypeButtonTextActive: {
    color: theme.colors.white,
    fontWeight: "600",
  },

  // LOCATION + SORT
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationScroll: {
    paddingVertical: 6,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginRight: 8,
    backgroundColor: theme.colors.white,
  },
  locationChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.background.soft,
  },
  locationChipText: {
    fontSize: 12,
    color: theme.text.subtle,
  },
  locationChipTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginLeft: "auto",
  },
  sortButtonText: {
    marginHorizontal: 4,
    fontSize: 12,
    color: theme.text.subtle,
  },

  resultCount: {
    fontSize: 13,
    color: theme.text.subtle,
    marginBottom: 8,
  },

  // JOB LIST
  jobList: {
    paddingBottom: 24,
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  emptyState: {
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: theme.text.heading,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: theme.text.subtle,
    textAlign: "center",
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text.heading,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text.heading,
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  filterOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterOptionText: {
    fontSize: 14,
    color: theme.text.body,
  },

  // DROPDOWN STYLES
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: theme.background.soft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  dropdownHeaderContent: {
    flex: 1,
  },
  dropdownHeaderTitle: {
    fontSize: 12,
    color: theme.text.subtle,
    fontWeight: "500",
    marginBottom: 4,
  },
  dropdownHeaderValue: {
    fontSize: 14,
    color: theme.text.heading,
    fontWeight: "600",
  },
  dropdownOptions: {
    marginTop: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: theme.text.body,
  },
  dropdownOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  salaryInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 8,
    fontSize: 14,
    color: theme.text.body,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  applyFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyFilterButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});

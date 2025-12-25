import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "../../constants/theme";
import HeroBanner from "../Component/HeroBanner";
import SidebarLayout, { useSidebar } from "../Component/SidebarLayout";

interface Job {
  id: number;
  title: string;
  company_name: string;
  salary_min: number;
  salary_max: number;
  location: string;
  salary_currency?: string;
  companies?: {
    name: string;
  };
  view_count?: number;
  job_type?: string;
}

export default function CandidateHome() {
  return (
    <SidebarLayout>
      <JobFindingContent />
    </SidebarLayout>
  );
}

function JobFindingContent() {
  const { toggleSidebar } = useSidebar();
  const [searchText, setSearchText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = React.useState<Job[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  React.useEffect(() => {
    loadJobs();
  }, []);

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
          view_count,
          companies(name)
        `
        )
        .eq("is_active", true);

      if (error) throw error;

      const jobsData = (data || []).map((job: any) => ({
        ...job,
        company_name: job.companies?.name || "Công ty",
      }));

      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let filtered = jobs;

    if (searchText.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchText.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((job) => job.job_type === selectedFilter);
    }

    setFilteredJobs(filtered);
  }, [searchText, selectedFilter, jobs]);

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || !max) return "Thương lượng";
    const format = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(0) + " triệu";
      if (num >= 1000) return (num / 1000).toFixed(0) + "k";
      return num.toString();
    };
    return `${format(min)} - ${format(max)}`;
  };

  const getJobTypeLabel = (jobType?: string) => {
    const typeMap: { [key: string]: string } = {
      "full-time": "Toàn thời gian",
      "part-time": "Bán thời gian",
      internship: "Thực tập",
      remote: "Remote",
      hybrid: "Hybrid",
    };
    return typeMap[jobType || ""] || jobType || "";
  };

  const JobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/Candidate/JobDetail`,
          params: { id: item.id.toString() },
        } as any)
      }
      style={{
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
              fontFamily: Fonts.sans,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textGray,
              marginBottom: 8,
              fontFamily: Fonts.sans,
            }}
          >
            {item.company_name}
          </Text>
        </View>
        {item.view_count && (
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
                fontFamily: Fonts.sans,
              }}
            >
              {item.view_count}
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
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
              fontFamily: Fonts.sans,
            }}
          >
            {item.location}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
            fontFamily: Fonts.sans,
          }}
        >
          {formatSalary(item.salary_min, item.salary_max, item.salary_currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Modern Header Bar */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
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

          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginLeft: 12 }}>
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
              Việc Làm
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
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#FF6B6B",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                2
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar in Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.white,
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.primary}
          />
          <TextInput
            placeholder="Tìm kiếm công việc..."
            placeholderTextColor={colors.textGray}
            value={searchText}
            onChangeText={setSearchText}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 8,
              fontSize: 14,
              color: colors.textDark,
            }}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, paddingHorizontal: 0, paddingTop: 0 }}
      >
        {/* Hero Banner */}
        <HeroBanner supportingText="Khám phá những cơ hội phù hợp với kỹ năng và nguyện vọng của bạn" />

        {/* Content Container with padding */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Filter Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedFilter("all")}
              style={{
                backgroundColor:
                  selectedFilter === "all" ? colors.primary : colors.white,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 12,
                borderWidth: selectedFilter === "all" ? 0 : 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  color:
                    selectedFilter === "all" ? colors.white : colors.textDark,
                  fontWeight: "500",
                  fontSize: 13,
                  fontFamily: Fonts.sans,
                }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {[
              { label: "Remote", value: "remote" },
              { label: "Thực tập", value: "internship" },
              { label: "Toàn thời gian", value: "full-time" },
              { label: "Bán thời gian", value: "part-time" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setSelectedFilter(filter.value)}
                style={{
                  backgroundColor:
                    selectedFilter === filter.value
                      ? colors.primary
                      : colors.white,
                  borderWidth: selectedFilter === filter.value ? 0 : 1,
                  borderColor: colors.borderLight,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedFilter === filter.value
                        ? colors.white
                        : colors.textDark,
                    fontWeight: "500",
                    fontSize: 13,
                    fontFamily: Fonts.sans,
                  }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Featured Jobs Section */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                  fontFamily: Fonts.sans,
                }}
              >
                Công việc nổi bật
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary,
                    fontWeight: "500",
                    fontFamily: Fonts.sans,
                  }}
                >
                  Xem tất cả →
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredJobs.length > 0 ? (
              <FlatList
                data={filteredJobs}
                renderItem={JobCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={48}
                  color={colors.textGray}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textGray,
                    marginTop: 12,
                    fontFamily: Fonts.sans,
                  }}
                >
                  Không tìm thấy công việc phù hợp
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

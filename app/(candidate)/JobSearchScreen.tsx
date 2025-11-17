import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  type: "Toàn thời gian" | "Bán thời gian" | "Thực tập" | "Remote";
  postedTime: string;
  tags: string[];
};

const mockJobs: Job[] = [
  {
    id: "1",
    title: "React Native Developer",
    company: "Công ty TNHH ABC",
    location: "Hà Nội",
    salaryRange: "20 - 30 triệu",
    type: "Toàn thời gian",
    postedTime: "2 ngày trước",
    tags: ["React Native", "TypeScript", "Mobile"],
  },
  {
    id: "2",
    title: "Frontend Developer (React)",
    company: "XYZ Technology",
    location: "TP. Hồ Chí Minh",
    salaryRange: "15 - 25 triệu",
    type: "Remote",
    postedTime: "Hôm nay",
    tags: ["ReactJS", "JavaScript", "Remote"],
  },
  {
    id: "3",
    title: "Thực tập sinh Lập trình",
    company: "Start-up 123",
    location: "Đà Nẵng",
    type: "Thực tập",
    postedTime: "3 ngày trước",
    tags: ["Intern", "Web", "Backend"],
  },
];

const jobTypes: Job["type"][] = [
  "Toàn thời gian",
  "Bán thời gian",
  "Thực tập",
  "Remote",
];

const locations = ["Tất cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"];

const sortOptions = ["Mới nhất", "Lương cao nhất", "Phù hợp nhất"];

const JobSearchScreen: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<Job["type"] | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string>("Tất cả");
  const [selectedSort, setSelectedSort] = useState<string>("Mới nhất");

  const filteredJobs = mockJobs.filter((job) => {
    const matchKeyword =
      keyword.trim().length === 0 ||
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.company.toLowerCase().includes(keyword.toLowerCase());

    const matchJobType = !selectedJobType || job.type === selectedJobType;

    const matchLocation =
      selectedLocation === "Tất cả" || job.location === selectedLocation;

    return matchKeyword && matchJobType && matchLocation;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
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
              placeholder="Nhập vị trí, kỹ năng, công ty..."
              placeholderTextColor={theme.text.subtle}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons
              name="options-outline"
              size={20}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* NÚT TOÀN THỜI GIAN / BÁN THỜI GIAN / THỰC TẬP / REMOTE */}
        <View style={styles.jobTypeRow}>
          {jobTypes.map((type, index) => {
            const isActive = selectedJobType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.jobTypeButton,
                  isActive && styles.jobTypeButtonActive,
                  index === jobTypes.length - 1 && { marginRight: 0 },
                ]}
                onPress={() => setSelectedJobType(isActive ? null : type)}
              >
                <Text
                  style={[
                    styles.jobTypeButtonText,
                    isActive && styles.jobTypeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Địa điểm + sắp xếp */}
        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationScroll}
          >
            {locations.map((loc) => {
              const isActive = selectedLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.locationChip,
                    isActive && styles.locationChipActive,
                  ]}
                  onPress={() => setSelectedLocation(loc)}
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={isActive ? theme.colors.primary : theme.text.subtle}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.locationChipText,
                      isActive && styles.locationChipTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.sortButton}>
            <Ionicons
              name="filter-outline"
              size={16}
              color={theme.text.subtle}
            />
            <Text style={styles.sortButtonText}>{selectedSort}</Text>
            <Ionicons
              name="chevron-down-outline"
              size={16}
              color={theme.text.subtle}
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
            >
              <View style={styles.jobCardHeader}>
                <View style={styles.jobIcon}>
                  <Text style={styles.jobIconText}>
                    {job.company.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                  <View style={styles.jobMetaRow}>
                    <View style={styles.jobMetaItem}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={theme.text.subtle}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.jobMetaText}>{job.location}</Text>
                    </View>
                    <View style={styles.jobMetaItem}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={theme.text.subtle}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.jobMetaText}>{job.postedTime}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {job.salaryRange && (
                <View style={styles.salaryPill}>
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color="#16A34A"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.salaryText}>{job.salaryRange}</Text>
                </View>
              )}

              <View style={styles.tagRow}>
                {job.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Ứng tuyển ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton}>
                  <Ionicons
                    name="bookmark-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
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
    </SafeAreaView>
  );
};

export default JobSearchScreen;

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
    backgroundColor: theme.background.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  jobCardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.background.soft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  jobIconText: {
    fontWeight: "700",
    color: theme.colors.primaryDark,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text.heading,
  },
  jobCompany: {
    fontSize: 13,
    color: theme.text.subtle,
    marginTop: 2,
  },
  jobMetaRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  jobMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  jobMetaText: {
    fontSize: 12,
    color: theme.text.subtle,
  },
  salaryPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
  },
  salaryText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.background.soft,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.primaryDark,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: theme.colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background.soft,
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
});

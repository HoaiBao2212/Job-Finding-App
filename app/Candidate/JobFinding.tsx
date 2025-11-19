import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, Fonts } from "../../constants/theme";
import SidebarLayout from "../Component/SidebarLayout";

interface Job {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  logo?: string;
  rating?: number;
}

const FEATURED_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior React Native Developer",
    company: "Tech Company A",
    salary: "20 - 30 triệu",
    location: "TP. Hồ Chí Minh",
    rating: 4.5,
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "Startup XYZ",
    salary: "15 - 25 triệu",
    location: "Hà Nội",
    rating: 4.2,
  },
  {
    id: "3",
    title: "Mobile App Developer",
    company: "Tech Company B",
    salary: "18 - 28 triệu",
    location: "Đà Nẵng",
    rating: 4.8,
  },
];

export default function CandidateHome() {
  const [searchText, setSearchText] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const JobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/Candidate/JobDetail",
          params: { id: item.id },
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
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.textGray, marginBottom: 8 }}
          >
            {item.company}
          </Text>
        </View>
        {item.rating && (
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
            <MaterialCommunityIcons name="star" size={14} color="#FFC107" />
            <Text
              style={{
                fontSize: 12,
                marginLeft: 4,
                color: colors.textDark,
                fontWeight: "500",
              }}
            >
              {item.rating}
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
            }}
          >
            {item.location}
          </Text>
        </View>
        <Text
          style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}
        >
          {item.salary}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SidebarLayout>
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
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
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
                Việc Làm
              </Text>
            </View>

            {/* Notification Button */}
            <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 12,
              }}
              onPress={() => setSidebarOpen(!sidebarOpen)}
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
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        >
          {/* Header Content */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 8,
                fontFamily: Fonts.sans,
              }}
            >
              Xin chào! 👋
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textGray,
                fontFamily: Fonts.sans,
              }}
            >
              Hôm nay bạn muốn tìm việc gì?
            </Text>
          </View>

          {/* Filter Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 12,
              }}
            >
              <Text
                style={{ color: colors.white, fontWeight: "500", fontSize: 13 }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {["Remote", "Thực tập", "Toàn thời gian", "Bán thời gian"].map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  style={{
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textDark,
                      fontWeight: "500",
                      fontSize: 13,
                    }}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              )
            )}
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
                  }}
                >
                  Xem tất cả →
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={FEATURED_JOBS}
              renderItem={JobCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Quick Stats */}
          <View
            style={{
              backgroundColor: colors.primarySoftBg,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <MaterialCommunityIcons
                name="briefcase"
                size={24}
                color={colors.primary}
              />
              <Text
                style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
              >
                Đã lưu
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                5
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <MaterialCommunityIcons
                name="file-check"
                size={24}
                color={colors.primary}
              />
              <Text
                style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
              >
                Đã nộp
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                3
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={colors.primary}
              />
              <Text
                style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}
              >
                Thông báo
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                2
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SidebarLayout>
  );
}

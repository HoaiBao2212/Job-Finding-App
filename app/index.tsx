import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/theme";

export default function Index() {
  const handleNavigate = (route: any) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        {/* Logo / Title */}
        <View style={{ marginBottom: 40, alignItems: "center" }}>
          <MaterialCommunityIcons
            name="briefcase"
            size={64}
            color={colors.primary}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.textDark,
              marginBottom: 8,
            }}
          >
            Việc Làm
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textGray,
              textAlign: "center",
            }}
          >
            Tìm công việc phù hợp với bạn
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={{ width: "100%", gap: 12 }}>
          {/* Applicant Dashboard */}
          <TouchableOpacity
            onPress={() => handleNavigate("/Applicant/Dashboard")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: colors.primary,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.shadowLight,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <MaterialCommunityIcons
              name="briefcase-account"
              size={20}
              color={colors.white}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Nhà tuyển dụng - Dashboard
            </Text>
          </TouchableOpacity>

          {/* Candidate JobFinding */}
          <TouchableOpacity
            onPress={() => handleNavigate("/Candidate/JobFinding")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Ứng viên - Tìm việc
            </Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            onPress={() => handleNavigate("/Candidate/CandidateProfileScreen")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Hồ sơ cá nhân
            </Text>
          </TouchableOpacity>
          {/* Login */}
          <TouchableOpacity
            onPress={() => handleNavigate("/(auth)/login")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
          {/* role select */}
          <TouchableOpacity
            onPress={() => handleNavigate("/role-select")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account"
              size={20}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              role select
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View
          style={{
            marginTop: 40,
            padding: 16,
            backgroundColor: colors.primarySoftBg,
            borderRadius: 12,
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.textGray,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            Ứng dụng giúp bạn tìm kiếm công việc phù hợp với năng lực và mong
            muốn của mình.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

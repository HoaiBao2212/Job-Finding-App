import { theme } from "@/constants/theme";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { colors } = theme;

export default function CandidateProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Nguyễn Văn A</Text>
            <Text style={styles.title}>React Native Developer</Text>
            <Text style={styles.location}>📍 Hồ Chí Minh, Việt Nam</Text>
          </View>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=32" }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.headerBottom}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>3+</Text>
            <Text style={styles.headerStatLabel}>Năm kinh nghiệm</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>12</Text>
            <Text style={styles.headerStatLabel}>Dự án</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>80%</Text>
            <Text style={styles.headerStatLabel}>Hồ sơ</Text>
          </View>
        </View>
      </View>

      {/* Thông tin liên hệ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>nguyenvana@example.com</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Số điện thoại</Text>
          <Text style={styles.itemValue}>+84 912 345 678</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>LinkedIn</Text>
          <Text style={[styles.itemValue, styles.link]}>
            linkedin.com/in/nguyenvana
          </Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>GitHub</Text>
          <Text style={[styles.itemValue, styles.link]}>
            github.com/nguyenvana
          </Text>
        </View>
      </View>

      {/* Giới thiệu */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Giới thiệu</Text>
        <Text style={styles.paragraph}>
          Lập trình viên React Native với hơn 3 năm kinh nghiệm xây dựng ứng
          dụng mobile đa nền tảng. Yêu thích UI/UX đơn giản, tối ưu hiệu năng và
          trải nghiệm người dùng.
        </Text>
      </View>

      {/* Kỹ năng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kỹ năng</Text>
        <View style={styles.chipRow}>
          {[
            "React Native",
            "TypeScript",
            "Expo",
            "REST API",
            "Git",
            "UI/UX cơ bản",
          ].map((skill) => (
            <View key={skill} style={styles.chip}>
              <Text style={styles.chipText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Kinh nghiệm làm việc */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kinh nghiệm làm việc</Text>

        <View style={styles.expItem}>
          <View style={styles.expHeaderRow}>
            <Text style={styles.expRole}>React Native Developer</Text>
            <Text style={styles.expTime}>2022 - Hiện tại</Text>
          </View>
          <Text style={styles.expCompany}>Công ty ABC</Text>
          <Text style={styles.expDesc}>
            - Phát triển và bảo trì ứng dụng tìm việc đa nền tảng.{"\n"}- Tối ưu
            hiệu năng, cải thiện trải nghiệm người dùng.{"\n"}- Làm việc với
            REST API, Firebase, Supabase.
          </Text>
        </View>

        <View style={styles.expItem}>
          <View style={styles.expHeaderRow}>
            <Text style={styles.expRole}>Mobile Developer</Text>
            <Text style={styles.expTime}>2020 - 2022</Text>
          </View>
          <Text style={styles.expCompany}>Công ty XYZ</Text>
          <Text style={styles.expDesc}>
            - Tham gia phát triển ứng dụng thương mại điện tử.{"\n"}- Chịu trách
            nhiệm UI, điều hướng, và state management.
          </Text>
        </View>
      </View>

      {/* Học vấn */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Học vấn</Text>
        <Text style={styles.eduSchool}>ĐH Công nghệ Thông tin</Text>
        <Text style={styles.eduMajor}>Ngành: Khoa học máy tính</Text>
        <Text style={styles.eduTime}>2016 - 2020 • GPA: 3.2/4.0</Text>
      </View>

      {/* Nút chỉnh sửa hồ sơ */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.main,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },
  title: {
    fontSize: 14,
    color: "#E3F2FD",
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: "#E3F2FD",
    marginTop: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginLeft: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  headerStat: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    alignItems: "center",
  },
  headerStatValue: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  headerStatLabel: {
    color: "#E3F2FD",
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: theme.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadowLight,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text.heading,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  itemLabel: {
    fontSize: 13,
    color: theme.text.subtle,
  },
  itemValue: {
    fontSize: 13,
    color: theme.text.body,
    maxWidth: "60%",
    textAlign: "right",
  },
  link: {
    color: colors.primaryDark,
  },
  paragraph: {
    fontSize: 13,
    color: theme.text.body,
    lineHeight: 18,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  chip: {
    backgroundColor: theme.background.soft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  chipText: {
    fontSize: 12,
    color: colors.primaryDark,
  },
  expItem: {
    marginTop: 10,
  },
  expHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  expRole: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text.body,
    maxWidth: "60%",
  },
  expTime: {
    fontSize: 12,
    color: theme.text.subtle,
  },
  expCompany: {
    fontSize: 13,
    color: theme.text.heading,
    marginTop: 2,
  },
  expDesc: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
    lineHeight: 17,
  },
  eduSchool: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text.body,
    marginTop: 4,
  },
  eduMajor: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  eduTime: {
    fontSize: 12,
    color: theme.text.subtle,
    marginTop: 2,
  },
  editButton: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: theme.button.primary.bg,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: theme.button.primary.text,
    fontSize: 15,
    fontWeight: "600",
  },
});

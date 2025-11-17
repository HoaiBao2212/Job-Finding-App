// app/(auth)/login.tsx  (hoặc path nào bạn đang dùng cho màn hình đăng nhập)

import { theme } from "@/constants/theme";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo + tên app */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>JF</Text>
          </View>
          <Text style={styles.appName}>JobFinder</Text>
          <Text style={styles.appSubtitle}>
            Đăng nhập để tìm công việc phù hợp với bạn
          </Text>
        </View>

        {/* Card login */}
        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nhapemail@gmail.com"
              placeholderTextColor={theme.colors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              secureTextEntry
            />
          </View>

          {/* Nút đăng nhập */}
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Hoặc */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.divider} />
          </View>

          {/* Nút tiếp tục với Google (secondary) */}
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Tiếp tục với Google</Text>
          </TouchableOpacity>
        </View>

        {/* Chưa có tài khoản */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Chưa có tài khoản?</Text>
          <TouchableOpacity>
            <Text style={styles.bottomLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primarySoftBg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 22,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text.heading ?? theme.colors.textBlue,
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textGray,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text.heading ?? theme.colors.textBlue,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.bgNeutral,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textDark,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: theme.button.primary.bg,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.button.primary.text,
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: theme.colors.textGray,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.button.secondary.border ?? theme.colors.primary,
    backgroundColor: theme.button.secondary.bg,
  },
  secondaryButtonText: {
    color: theme.button.secondary.text,
    fontSize: 15,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  bottomText: {
    fontSize: 14,
    color: theme.colors.textGray,
  },
  bottomLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});

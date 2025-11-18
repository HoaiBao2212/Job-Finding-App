// app/(auth)/login.tsx
import { Fonts, theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      // 1. Đăng nhập
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Đăng nhập thất bại", error.message);
        return;
      }

      // 2. Lấy user hiện tại
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Lỗi", "Không lấy được thông tin tài khoản.");
        return;
      }

      const userId = user.id;

      // 3. Kiểm tra hồ sơ trong bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone, location, role")
        .eq("id", userId)
        .single();

      // Nếu chưa có profile → bắt user hoàn thiện thông tin
      if (profileError || !profile) {
        router.replace("/complete-profile");
        return;
      }

      // 4. Kiểm tra thông tin bắt buộc
      const requiredFields = ["full_name", "phone", "location", "role"];
      const missing = requiredFields.some((field) => !(profile as any)[field]);

      if (missing) {
        router.replace("/complete-profile");
        return;
      }

      // 5. Chuyển hướng theo role
      if (profile.role === "candidate") {
        router.replace("/Candidate/JobFinding");
      } else if (profile.role === "employer") {
        router.replace("/Employer/Dashboard");
      } else {
        // Trường hợp role bị null hoặc giá trị lạ
        Alert.alert(
          "Thiếu vai trò",
          "Bạn chưa chọn vai trò. Vui lòng hoàn thiện hồ sơ."
        );
        router.replace("/complete-profile");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="email@gmail.com"
              placeholderTextColor={theme.colors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mật khẩu</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Nút đăng nhập */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
          <View style={styles.labelForgot}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chưa có tài khoản */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
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
    backgroundColor: theme.background.soft,
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
    fontFamily: Fonts.sans,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.text.heading,
    fontFamily: Fonts.sans,
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: theme.text.subtle,
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  card: {
    backgroundColor: theme.background.card,
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
    color: theme.text.heading,
    marginBottom: 16,
    fontFamily: Fonts.sans,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginBottom: 6,
    fontFamily: Fonts.sans,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelForgot: {
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "500",
    fontFamily: Fonts.sans,
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
    fontFamily: Fonts.sans,
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
    fontFamily: Fonts.sans,
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
    fontFamily: Fonts.sans,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.button.secondary.border,
    backgroundColor: theme.button.secondary.bg,
  },
  secondaryButtonText: {
    color: theme.button.secondary.text,
    fontSize: 15,
    fontWeight: "500",
    fontFamily: Fonts.sans,
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
    fontFamily: Fonts.sans,
  },
  bottomLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
});

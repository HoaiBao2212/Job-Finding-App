import AlertModal from "@/app/Component/AlertModal";
import { useAlert } from "@/app/Component/useAlert.hook";
import { Fonts, theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { alertState, showAlert, hideAlert } = useAlert();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showAlert("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường");
      return;
    }

    if (password.length < 6) {
      showAlert("Mật khẩu yếu", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Không khớp", "Mật khẩu và xác nhận mật khẩu không trùng");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // optional: nếu bạn muốn lưu thêm metadata:
        // options: {
        //   data: {
        //     full_name: fullName,
        //   },
        // },
      });

      if (error) {
        showAlert("Đăng ký thất bại", error.message);
        return;
      }

      // Tuỳ config Supabase:
      // - Nếu bật email confirmation: user phải vào mail để xác nhận
      // - Nếu tắt: có thể login luôn
      showAlert(
        "Thành công",
        "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
        [
          {
            text: "OK",
            style: "default",
            onPress: () => {
              hideAlert();
              router.replace("/(auth)/login");
            },
          },
        ]
      );

      // Điều hướng về màn đăng nhập
    } catch (err: any) {
      showAlert("Lỗi", err?.message || "Đã xảy ra lỗi, vui lòng thử lại");
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
          <View className="logoCircle" style={styles.logoCircle}>
            <Text style={styles.logoText}>JF</Text>
          </View>
          <Text style={styles.appName}>JobFinder</Text>
          <Text style={styles.appSubtitle}>
            Tạo tài khoản để bắt đầu tìm việc
          </Text>
        </View>

        {/* Card đăng ký */}
        <View style={styles.card}>
          <Text style={styles.title}>Đăng ký</Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nhapemail@gmail.com"
              placeholderTextColor={theme.colors.textGray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.field}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={styles.field}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Nút đăng ký */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Đã có tài khoản */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.bottomLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
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

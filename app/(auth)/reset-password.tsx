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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!password || !confirm) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Không khớp", "Mật khẩu và xác nhận không trùng nhau.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu phải tối thiểu 6 ký tự.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        Alert.alert("Đổi mật khẩu thất bại", error.message);
        return;
      }

      Alert.alert("Thành công", "Mật khẩu đã được thay đổi.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>JF</Text>
          </View>
          <Text style={styles.appName}>JobFinder</Text>
          <Text style={styles.appSubtitle}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đặt mật khẩu mới</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textGray}
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Lưu mật khẩu mới</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.backToLoginText}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background.soft },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  logoWrapper: { alignItems: "center", marginBottom: 32 },
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
  field: { marginBottom: 16 },
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
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  backToLogin: { marginTop: 16, alignItems: "center" },
  backToLoginText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: Fonts.sans,
  },
});

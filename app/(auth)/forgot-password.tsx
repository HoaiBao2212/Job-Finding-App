import AlertModal from "@/app/Component/AlertModal";
import { useAlert } from "@/app/Component/useAlert";
import { Fonts, theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { alertState, showAlert, hideAlert } = useAlert();

  const handleSendResetEmail = async () => {
    if (!email) {
      showAlert("Thiếu thông tin", "Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:8081/reset-password",
      });

      if (error) {
        showAlert("Gửi thất bại", error.message);
        return;
      }

      showAlert(
        "Đã gửi",
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
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

      // quay lại màn đăng nhập
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
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>JF</Text>
          </View>
          <Text style={styles.appName}>JobFinder</Text>
          <Text style={styles.appSubtitle}>
            Nhập email để đặt lại mật khẩu của bạn
          </Text>
        </View>

        {/* Card quên mật khẩu */}
        <View style={styles.card}>
          <Text style={styles.title}>Quên mật khẩu</Text>

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

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleSendResetEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Gửi email đặt lại mật khẩu
              </Text>
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
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.sans,
    textAlign: "center",
  },
  backToLogin: {
    marginTop: 16,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: Fonts.sans,
  },
});

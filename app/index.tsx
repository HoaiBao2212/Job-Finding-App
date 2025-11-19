// app/index.tsx
import { Fonts, theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Lấy user hiện tại
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        // Nếu lỗi hoặc không có user -> về màn login
        if (userError || !user) {
          router.replace("/(auth)/login");
          return;
        }

        // 2. Lấy profile từ bảng profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, location, role")
          .eq("id", user.id)
          .single();

        // Chưa có profile -> bắt hoàn thiện
        if (profileError || !profile) {
          router.replace("/complete-profile");
          return;
        }

        // 3. Kiểm tra thiếu thông tin quan trọng
        const requiredFields = ["full_name", "phone", "location", "role"];
        const missing = requiredFields.some(
          (field) => !(profile as any)[field]
        );

        if (missing) {
          router.replace("/complete-profile");
          return;
        }

        // 4. Điều hướng theo role
        if (profile.role === "employer") {
          router.replace("/Employer/Dashboard");
        } else {
          // mặc định là candidate
          router.replace("/Candidate/JobFinding");
        }
      } catch (err) {
        // Có lỗi gì thì cho về login để user tự đăng nhập lại
        console.error("checkSession error:", err);
        router.replace("/(auth)/login");
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  // Màn hình splash / loading trong lúc kiểm tra session
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.soft }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            marginTop: 12,
            color: theme.text.subtle,
            fontFamily: Fonts.sans,
            fontSize: 14,
          }}
        >
          Đang kiểm tra phiên đăng nhập...
        </Text>
      </View>
    </SafeAreaView>
  );
}

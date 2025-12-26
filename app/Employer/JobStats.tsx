import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { jobService } from "../../lib/services/jobService";
import EmployerSidebarLayout from "./../Component/EmployerSidebarLayout";

export default function JobStats() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    load();
  }, [jobId]);

  const load = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return router.push("/(auth)/login");
      if (!jobId) return;
      const j = await jobService.getJobById(jobId);
      setJob(j || null);
    } catch (error) {
      console.error("Error loading job stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployerSidebarLayout>
      <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingTop: 36, paddingBottom: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, width: 50, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" }}>
                <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: colors.white }}>Báo cáo tin tuyển</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{job?.title || "—"}</Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 }}>
            <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Tổng quan tin tuyển</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{job?.applications?.length || job?.applications || 0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Ứng tuyển</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{job?.view_count || 0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Lượt xem</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Đã tuyển</Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Ứng tuyển (7 ngày)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: "#F5F7FF", padding: 12, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Tổng (7 ngày)</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#F0FBF6", padding: 12, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Trung bình / ngày</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>0.0</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#FFF8F0", padding: 12, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Ngày cao nhất</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </EmployerSidebarLayout>
  );
}

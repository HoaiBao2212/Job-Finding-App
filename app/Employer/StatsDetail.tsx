import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Donut chart using react-native-svg (more compatible)
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { employerService } from "../../lib/services/employerService";
import { jobService } from "../../lib/services/jobService";
import EmployerSidebarLayout from "./../Component/EmployerSidebarLayout";

export default function StatsDetail() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return router.push("/(auth)/login");

      const employer = await employerService.getEmployerProfile(user.id);
      if (!employer?.id) return;

      const jobStats = await employerService.getJobStats(employer.id);
      setStats(jobStats || {});

      const employerJobs = await jobService.getEmployerJobs(employer.id);
      setJobs(employerJobs || []);
    } catch (error) {
      console.error("Error loading stats detail:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployerSidebarLayout>
      <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 36,
              paddingBottom: 18,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  marginRight: 12,
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: colors.white }}>
                  Báo cáo chi tiết
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                  Thống kê tuyển dụng tổng quan
                </Text>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 }}>
            <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Tổng quan</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{stats.total || 0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Tin tuyển</Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{stats.totalApplied || 0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Hồ sơ ứng tuyển</Text>
                </View>
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textDark }}>{stats.totalViews || 0}</Text>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Lượt xem</Text>
                </View>
              </View>

              {/* KPI / Ratio Card */}
              <View style={{ marginTop: 12, backgroundColor: "#FAFBFF", padding: 12, borderRadius: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Phân tích: Lượt xem vs Hồ sơ ứng tuyển</Text>
                <Text style={{ fontSize: 12, color: colors.textGray, marginBottom: 8 }}>So sánh tổng lượt xem và số hồ sơ ứng tuyển để đánh giá hiệu quả.</Text>

                {/* Donut chart */}
                {(() => {
                  const views = stats.totalViews || 0;
                  const apps = stats.totalApplied || 0;
                  const total = views + apps;
                  const viewsPct = total > 0 ? (views / total) * 100 : 0;
                  const appsPct = total > 0 ? (apps / total) * 100 : 0;
                  const radius = 50;
                  const strokeWidth = 14;
                  const circumference = 2 * Math.PI * radius;
                  const viewsLength = (viewsPct / 100) * circumference;
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ width: 120, alignItems: "center", justifyContent: "center" }}>
                        <Svg width={120} height={120} viewBox="0 0 120 120">
                          <Circle
                            cx={60}
                            cy={60}
                            r={radius}
                            stroke="#EEE"
                            strokeWidth={strokeWidth}
                            fill="none"
                          />
                          <Circle
                            cx={60}
                            cy={60}
                            r={radius}
                            stroke="#FF7A45"
                            strokeWidth={strokeWidth}
                            strokeLinecap="butt"
                            strokeDasharray={`${viewsLength} ${circumference - viewsLength}`}
                            rotation={-90}
                            origin="60, 60"
                            fill="none"
                          />
                          <Circle
                            cx={60}
                            cy={60}
                            r={radius}
                            stroke="#52C41A"
                            strokeWidth={strokeWidth}
                            strokeLinecap="butt"
                            strokeDasharray={`${circumference - viewsLength} ${viewsLength}`}
                            rotation={-90 + (viewsPct / 100) * 360}
                            origin="60, 60"
                            fill="none"
                          />
                        </Svg>
                        <View style={{ position: "absolute", alignItems: "center" }}>
                          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textDark }}>{total}</Text>
                          <Text style={{ fontSize: 11, color: colors.textGray }}>Tổng</Text>
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                          <View style={{ width: 12, height: 12, backgroundColor: "#FF7A45", borderRadius: 3, marginRight: 8 }} />
                          <Text style={{ fontSize: 13, color: colors.textDark }}>Lượt xem: </Text>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textDark, marginLeft: 6 }}>{views} ({Math.round(viewsPct)}%)</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, backgroundColor: "#52C41A", borderRadius: 3, marginRight: 8 }} />
                          <Text style={{ fontSize: 13, color: colors.textDark }}>Hồ sơ ứng tuyển: </Text>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textDark, marginLeft: 6 }}>{apps} ({Math.round(appsPct)}%)</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
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

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Top tin tuyển</Text>
              {jobs.length === 0 ? (
                <Text style={{ color: colors.textGray }}>Không có tin tuyển</Text>
              ) : (
                jobs.map((j) => (
                  <View key={j.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textDark }}>{j.title}</Text>
                      <Text style={{ fontSize: 12, color: colors.textGray }}>{(j.applications || 0)} ứng tuyển • {(j.view_count || 0)} lượt xem</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/Employer/JobStats?jobId=${j.id}`)}
                      style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                    >
                      <Text style={{ color: colors.white, fontWeight: "700" }}>Xem</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.textDark, marginBottom: 8 }}>Phân loại trạng thái ứng tuyển</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <View style={{ width: "48%", backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Mới</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
                <View style={{ width: "48%", backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Đang xử lý</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
                <View style={{ width: "48%", backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Phỏng vấn</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
                <View style={{ width: "48%", backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.textGray }}>Đã tuyển</Text>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textDark }}>0</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </EmployerSidebarLayout>
  );
}

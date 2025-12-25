import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { jobService } from "../../lib/services/jobService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert.hook";

interface JobEditFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number | string;
  salary_max: number | string;
  salary_currency: string;
  deadline: string;
  is_active: boolean;
}

export default function JobEditingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<JobEditFormData>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "full-time",
    experience_level: "entry",
    salary_min: "",
    salary_max: "",
    salary_currency: "VND",
    deadline: "",
    is_active: true,
  });

  const { alertState, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    if (jobId && !isNaN(jobId)) {
      loadJobDetail();
    } else {
      setLoading(false);
      showAlert("Lỗi", "Không có ID công việc để chỉnh sửa");
    }
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(jobId!);
      if (jobData) {
        setFormData({
          title: jobData.title || "",
          description: jobData.description || "",
          requirements: jobData.requirements || "",
          location: jobData.location || "",
          job_type: jobData.job_type || "full-time",
          experience_level: jobData.experience_level || "entry",
          salary_min: jobData.salary_min || "",
          salary_max: jobData.salary_max || "",
          salary_currency: jobData.salary_currency || "VND",
          deadline: jobData.deadline || "",
          is_active: jobData.is_active || true,
        });
      }
    } catch (error) {
      console.error("Error loading job detail:", error);
      showAlert("Lỗi", "Không thể tải thông tin công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!jobId) return;

    if (!formData.title.trim()) {
      showAlert("Cảnh báo", "Tiêu đề công việc không được để trống");
      return;
    }

    if (!formData.description.trim()) {
      showAlert("Cảnh báo", "Mô tả công việc không được để trống");
      return;
    }

    if (!formData.location.trim()) {
      showAlert("Cảnh báo", "Địa điểm không được để trống");
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        ...formData,
        salary_min: formData.salary_min
          ? parseInt(String(formData.salary_min))
          : null,
        salary_max: formData.salary_max
          ? parseInt(String(formData.salary_max))
          : null,
      };

      await jobService.updateJob(jobId, updateData);
      showAlert("Thành công", "Cập nhật công việc thành công", [
        {
          text: "OK",
          onPress: () => {
            hideAlert();
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating job:", error);
      showAlert("Lỗi", "Không thể cập nhật công việc");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textGray }}>
              Đang tải thông tin...
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 35,
              paddingBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: 12 }}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={colors.white}
              />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: colors.white,
                marginBottom: 8,
              }}
            >
              Chỉnh sửa công việc
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Cập nhật thông tin công việc của bạn
            </Text>
          </View>

          {/* Form Content */}
          <View style={{ padding: 16, paddingBottom: 32 }}>
            {/* Title */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Tiêu đề công việc <Text style={{ color: "#FF4D4F" }}>*</Text>
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Nhập tiêu đề công việc"
                placeholderTextColor={colors.textGray}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Mô tả công việc <Text style={{ color: "#FF4D4F" }}>*</Text>
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Nhập mô tả chi tiết về công việc"
                placeholderTextColor={colors.textGray}
                multiline
                numberOfLines={5}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Requirements */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Yêu cầu công việc
              </Text>
              <TextInput
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholder="Mỗi yêu cầu trên một dòng"
                placeholderTextColor={colors.textGray}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Location */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Địa điểm <Text style={{ color: "#FF4D4F" }}>*</Text>
              </Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                placeholderTextColor={colors.textGray}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              />
            </View>

            {/* Job Type */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Loại công việc
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["full-time", "part-time", "contract", "freelance"].map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() =>
                        setFormData({ ...formData, job_type: type })
                      }
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor:
                          formData.job_type === type
                            ? colors.primary
                            : colors.white,
                        borderWidth: 1,
                        borderColor:
                          formData.job_type === type
                            ? colors.primary
                            : colors.borderLight,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color:
                            formData.job_type === type
                              ? colors.white
                              : colors.textDark,
                        }}
                      >
                        {type === "full-time"
                          ? "Toàn thời gian"
                          : type === "part-time"
                          ? "Bán thời gian"
                          : type === "contract"
                          ? "Hợp đồng"
                          : "Freelance"}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Experience Level */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Cấp độ kinh nghiệm
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["entry", "mid", "senior"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() =>
                      setFormData({ ...formData, experience_level: level })
                    }
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        formData.experience_level === level
                          ? colors.primary
                          : colors.white,
                      borderWidth: 1,
                      borderColor:
                        formData.experience_level === level
                          ? colors.primary
                          : colors.borderLight,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          formData.experience_level === level
                            ? colors.white
                            : colors.textDark,
                      }}
                    >
                      {level === "entry"
                        ? "Mới"
                        : level === "mid"
                        ? "Trung cấp"
                        : "Cao cấp"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Salary Min */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Lương tối thiểu
              </Text>
              <TextInput
                value={String(formData.salary_min)}
                onChangeText={(text) =>
                  setFormData({ ...formData, salary_min: text })
                }
                placeholder="VD: 15000000"
                placeholderTextColor={colors.textGray}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              />
            </View>

            {/* Salary Max */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Lương tối đa
              </Text>
              <TextInput
                value={String(formData.salary_max)}
                onChangeText={(text) =>
                  setFormData({ ...formData, salary_max: text })
                }
                placeholder="VD: 25000000"
                placeholderTextColor={colors.textGray}
                keyboardType="numeric"
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              />
            </View>

            {/* Salary Currency */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Đơn vị tiền tệ
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["VND", "USD", "EUR"].map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    onPress={() =>
                      setFormData({ ...formData, salary_currency: currency })
                    }
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        formData.salary_currency === currency
                          ? colors.primary
                          : colors.white,
                      borderWidth: 1,
                      borderColor:
                        formData.salary_currency === currency
                          ? colors.primary
                          : colors.borderLight,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          formData.salary_currency === currency
                            ? colors.white
                            : colors.textDark,
                      }}
                    >
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deadline */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Hạn chót ứng tuyển
              </Text>
              <TextInput
                value={formData.deadline}
                onChangeText={(text) =>
                  setFormData({ ...formData, deadline: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textGray}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              />
            </View>

            {/* Active Status */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.textDark,
                    }}
                  >
                    Trạng thái
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginTop: 2,
                    }}
                  >
                    {formData.is_active ? "Đang tuyển" : "Đóng"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({
                      ...formData,
                      is_active: !formData.is_active,
                    })
                  }
                  style={{
                    width: 50,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: formData.is_active ? "#52C41A" : "#D9D9D9",
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.white,
                      alignSelf: formData.is_active ? "flex-end" : "flex-start",
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textDark,
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateJob}
                disabled={saving}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.white,
                    }}
                  >
                    Cập nhật
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    </EmployerSidebarLayout>
  );
}

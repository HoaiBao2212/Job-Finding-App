import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { employerService } from "../../lib/services/employerService";
import { jobService } from "../../lib/services/jobService";
import { skillService } from "../../lib/services/skillService";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";

type Skill = {
  id: number;
  name: string;
  category: string;
};

// Custom Alert Component để hoạt động trên web và mobile
const AlertModal = ({
  visible,
  title,
  message,
  buttons,
}: {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: Array<{ text: string; onPress?: () => void }>;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 20,
            minWidth: 300,
            maxWidth: 500,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 12,
              }}
            >
              {title}
            </Text>
          )}
          {message && (
            <Text
              style={{
                fontSize: 14,
                color: colors.textGray,
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              {message}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            {buttons?.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={button.onPress}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    index === buttons.length - 1
                      ? colors.primary
                      : colors.borderLight,
                  minWidth: 80,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      index === buttons.length - 1
                        ? colors.white
                        : colors.textDark,
                  }}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgNeutral,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputField: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  salaryRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  salarySeparator: {
    color: colors.textGray,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 20,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
  },
  datePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  datePickerItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
  },
  datePickerButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
});

export default function JobPostingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = useState(!!jobId);
  const [submitting, setSubmitting] = useState(false);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<
    Array<{ text: string; onPress?: () => void }>
  >([]);

  // Helper function để show alert
  const showAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void }>
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtons(
      buttons || [{ text: "OK", onPress: () => setAlertVisible(false) }]
    );
    setAlertVisible(true);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "full-time" as
      | "full-time"
      | "part-time"
      | "internship"
      | "remote"
      | "hybrid",
    experience_level: "mid" as "junior" | "mid" | "senior",
    salary_min: "",
    salary_max: "",
    salary_currency: "VND",
    deadline: "",
  });

  const jobTypes = [
    { label: "Toàn thời gian", value: "full-time" },
    { label: "Bán thời gian", value: "part-time" },
    { label: "Thực tập", value: "internship" },
    { label: "Làm việc từ xa", value: "remote" },
    { label: "Kết hợp", value: "hybrid" },
  ];

  const experienceLevels = [
    { label: "Người mới", value: "junior" },
    { label: "Trung cấp", value: "mid" },
    { label: "Cao cấp", value: "senior" },
  ];

  // 9 nhóm kỹ năng
  const skillCategories = [
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
    { label: "Mobile", value: "mobile" },
    { label: "Database", value: "database" },
    { label: "DevOps / Cloud", value: "devops_cloud" },
    { label: "Data / AI", value: "data_ai" },
    { label: "Testing / QA", value: "testing" },
    { label: "Game", value: "game" },
    { label: "Khác", value: "other" },
  ];

  // chọn nhiều nhóm
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  useEffect(() => {
    initializeForm();
  }, []);

  // khi đổi nhóm kỹ năng -> load lại danh sách skill
  useEffect(() => {
    const load = async () => {
      if (selectedCategories.length === 0) {
        setSkills([]);
        setSelectedSkillIds([]);
        return;
      }

      try {
        const data = await skillService.getSkillsByCategories(
          selectedCategories
        );
        setSkills(data || []);
      } catch (error) {
        console.error("Error fetching skills by categories:", error);
        showAlert("Lỗi", "Không thể tải danh sách kỹ năng");
      }
    };

    load();
  }, [selectedCategories]);

  const initializeForm = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      const employer = await employerService.getEmployerProfile(user.id);
      if (employer?.id && employer.company_id) {
        setEmployerId(employer.id);
        setCompanyId(employer.company_id);

        if (jobId) {
          // load job
          const job = await jobService.getJobById(jobId);
          if (job) {
            setFormData({
              title: job.title || "",
              description: job.description || "",
              requirements: job.requirements || "",
              location: job.location || "",
              job_type: job.job_type || "full-time",
              experience_level: job.experience_level || "mid",
              salary_min: job.salary_min?.toString() || "",
              salary_max: job.salary_max?.toString() || "",
              salary_currency: job.salary_currency || "VND",
              deadline: job.deadline
                ? new Date(job.deadline).toISOString().split("T")[0]
                : "",
            });
          }

          // load skill đã gán cho job
          const existingSkills = await skillService.getSkillsByJob(jobId);
          if (existingSkills && existingSkills.length > 0) {
            setSelectedSkillIds(existingSkills.map((s) => s.id));

            const cats = Array.from(
              new Set(existingSkills.map((s) => s.category))
            );
            setSelectedCategories(cats);

            // đồng thời load toàn bộ skill trong các nhóm này
            const allSkills = await skillService.getSkillsByCategories(cats);
            setSkills(allSkills || []);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      showAlert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (id: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const numValue = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(numValue)) return "";
    return numValue.toLocaleString("vi-VN");
  };

  const handleSalaryChange = (
    text: string,
    field: "salary_min" | "salary_max"
  ) => {
    const numericValue = text.replace(/\D/g, "");
    setFormData({ ...formData, [field]: numericValue });
  };

  const formatDeadlineInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "");

    // Quy luật date formatting thông minh:
    // 1. Ngày (1-31): nếu 1 chữ từ 3-9 → thêm 0 và /; nếu 2 chữ 01-31 → thêm /
    // 2. Tháng (01-12): nếu 1 chữ từ 2-9 → thêm 0 và /; nếu 2 chữ 01-12 → thêm /
    // 3. Năm: lấy 4 chữ số đầu

    if (cleaned.length === 0) return "";

    // ===== PHẦN NGÀY (Chữ số 1-2) =====
    if (cleaned.length === 1) {
      const dayDigit = parseInt(cleaned, 10);
      // Chờ chữ số tiếp theo để xác định ngày (có thể là 03-09 hoặc 30-39)
      return cleaned;
    }

    if (cleaned.length === 2) {
      const day = parseInt(cleaned, 10);
      // Nếu ngày 01-31 hợp lệ, thêm /
      if (day >= 1 && day <= 31) {
        // Nếu là 03-09, thêm 0 phía trước
        if (day >= 3 && day <= 9) {
          return `0${day}/`;
        }
        // Ngày khác (01-02, 10-31) thêm / bình thường
        return `${cleaned}/`;
      }
      // Nếu ngày > 31, xử lý bằng cách tách thành ngày + tháng
      if (day > 31) {
        const d1 = cleaned[0];
        const d2 = cleaned[1];
        // Số thứ nhất có thể là ngày (nếu ≤ 3)
        if (parseInt(d1, 10) <= 3) {
          return `0${d1}/${d2}`;
        }
        return `${d1}/${d2}`;
      }
      return cleaned;
    }

    // ===== PHẦN THÁNG (Chữ số 3-4) =====
    if (cleaned.length === 3) {
      const dayPart = cleaned.slice(0, 2);
      const monthDigit1 = parseInt(cleaned.slice(2, 3), 10);
      const day = parseInt(dayPart, 10);

      // Xử lý ngày không hợp lệ trước
      if (day > 31) {
        return `${dayPart}/${cleaned.slice(2, 3)}`;
      }

      // Nếu tháng là chữ số 2-9, tự động thêm 0 phía trước và /
      if (monthDigit1 >= 2 && monthDigit1 <= 9) {
        return `${dayPart}/0${monthDigit1}/`;
      }
      // Nếu là 0 hoặc 1, chờ chữ số tiếp theo
      return `${dayPart}/${cleaned.slice(2, 3)}`;
    }

    if (cleaned.length === 4) {
      const dayPart = cleaned.slice(0, 2);
      const monthPart = cleaned.slice(2, 4);
      const day = parseInt(dayPart, 10);
      const month = parseInt(monthPart, 10);

      // Xử lý ngày không hợp lệ
      if (day < 1 || day > 31) {
        const d1 = dayPart[0];
        const d2 = dayPart[1];
        if (parseInt(dayPart, 10) > 31) {
          return `${d1}/${d2}/${monthPart}`;
        }
      }

      // Kiểm tra tháng hợp lệ (01-12)
      if (month >= 1 && month <= 12) {
        // Nếu tháng là 1-9 mà chưa có leading 0, thêm 0 và /
        if (month >= 1 && month <= 9 && monthPart[0] !== "0") {
          return `${dayPart}/0${monthPart}/`;
        }
        // Nếu là 10-12, thêm /
        return `${dayPart}/${monthPart}/`;
      }

      // Nếu tháng > 12, tách thành tháng + năm
      if (month > 12) {
        const m1 = monthPart[0];
        const m2 = monthPart[1];
        return `${dayPart}/${m1}/${m2}`;
      }

      return `${dayPart}/${monthPart}`;
    }

    // ===== PHẦN NĂM (Chữ số 5+) =====
    if (cleaned.length === 5) {
      const dayPart = cleaned.slice(0, 2);
      const monthPart = cleaned.slice(2, 4);
      const yearDigit1 = cleaned.slice(4, 5);

      return `${dayPart}/${monthPart}/${yearDigit1}`;
    }

    if (cleaned.length === 6) {
      const dayPart = cleaned.slice(0, 2);
      const monthPart = cleaned.slice(2, 4);
      const yearPart2 = cleaned.slice(4, 6);

      return `${dayPart}/${monthPart}/${yearPart2}`;
    }

    if (cleaned.length === 7) {
      const dayPart = cleaned.slice(0, 2);
      const monthPart = cleaned.slice(2, 4);
      const yearPart3 = cleaned.slice(4, 7);

      return `${dayPart}/${monthPart}/${yearPart3}`;
    }

    // Đầy đủ 8 chữ số: DD/MM/YYYY
    if (cleaned.length >= 8) {
      const dayPart = cleaned.slice(0, 2);
      const monthPart = cleaned.slice(2, 4);
      const yearPart = cleaned.slice(4, 8);

      return `${dayPart}/${monthPart}/${yearPart}`;
    }

    return cleaned;
  };

  const handleDeadlineChange = (text: string) => {
    // Nếu user xóa "/" ở cuối (backspace), cho phép xóa
    const currentDeadline = formData.deadline;

    // Nếu text ngắn hơn current deadline, user đang xóa
    if (text.length < currentDeadline.length) {
      // Cho phép xóa bình thường mà không định dạng lại
      setFormData({ ...formData, deadline: text });
      return;
    }

    // Nếu user đang thêm ký tự, áp dụng định dạng thông minh
    const formatted = formatDeadlineInput(text);
    setFormData({ ...formData, deadline: formatted });
  };

  const parseDeadlineFromInput = (dateStr: string): string | null => {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (day.length !== 2 || month.length !== 2 || year.length !== 4)
      return null;
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    try {
      // Kiểm tra tiêu đề
      if (!formData.title.trim()) {
        showAlert("Lỗi", "Vui lòng nhập tiêu đề công việc");
        return;
      }

      // Kiểm tra mô tả
      if (!formData.description.trim()) {
        showAlert("Lỗi", "Vui lòng nhập mô tả công việc");
        return;
      }

      // Kiểm tra nhà tuyển dụng
      if (!employerId || !companyId) {
        showAlert("Lỗi", "Không tìm thấy thông tin nhà tuyển dụng");
        return;
      }

      // Kiểm tra lương
      if (formData.salary_min && formData.salary_max) {
        if (parseInt(formData.salary_min) > parseInt(formData.salary_max)) {
          showAlert("Lỗi", "Lương tối thiểu không được lớn hơn lương tối đa");
          return;
        }
      }

      // Kiểm tra hạn chót
      if (!formData.deadline.trim()) {
        showAlert("Lỗi", "Vui lòng nhập hạn chót ứng tuyển");
        return;
      }

      // Parse deadline từ input DD/MM/YYYY
      const parsedDeadline = parseDeadlineFromInput(formData.deadline);
      if (!parsedDeadline) {
        showAlert("Lỗi", "Hạn chót không hợp lệ. Vui lòng nhập DD/MM/YYYY");
        return;
      }

      // Kiểm tra hạn chót không được trong quá khứ
      const selectedDate = new Date(parsedDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showAlert("Lỗi", "Hạn chót ứng tuyển không được là ngày trong quá khứ");
        return;
      }

      setSubmitting(true);

      const jobData = {
        company_id: companyId,
        created_by_employer_id: employerId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || null,
        location: formData.location.trim() || null,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        deadline: parsedDeadline ? `${parsedDeadline}T23:59:59+00:00` : null,
        is_active: true,
      };

      let savedJobId = jobId;

      if (jobId) {
        await jobService.updateJob(jobId, jobData);
      } else {
        // createJob phải trả về record có id
        const newJob = await jobService.createJob(jobData);
        savedJobId = newJob.id;
      }

      // lưu job_skills
      if (savedJobId) {
        await skillService.saveJobSkills(savedJobId, selectedSkillIds);
      }

      showAlert(
        "Thành công",
        jobId
          ? "Cập nhật tin tuyển dụng thành công"
          : "Tạo tin tuyển dụng thành công",
        [
          {
            text: "OK",
            onPress: () => {
              setAlertVisible(false);
              router.push("/Employer/JobApplication");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting job:", error);
      showAlert("Lỗi", "Có lỗi khi lưu tin tuyển dụng: " + error?.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
      />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {jobId ? "Chỉnh sửa tin" : "Đăng tin tuyển dụng"}
              </Text>
              <View style={{ width: 50 }} />
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Tiêu đề */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Tiêu đề công việc *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Ví dụ: React Native Developer"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholderTextColor={colors.textGray}
              />
            </View>

            {/* Mô tả công việc */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Mô tả công việc *</Text>
              <TextInput
                style={[styles.inputField, styles.inputMultiline]}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                multiline
                numberOfLines={5}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholderTextColor={colors.textGray}
              />
            </View>

            {/* Yêu cầu */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Yêu cầu công việc</Text>
              <TextInput
                style={[styles.inputField, styles.inputMultiline]}
                placeholder="Liệt kê các yêu cầu kỹ năng, kinh nghiệm..."
                multiline
                numberOfLines={4}
                value={formData.requirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, requirements: text })
                }
                placeholderTextColor={colors.textGray}
              />
            </View>

            {/* Địa điểm */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Địa điểm làm việc</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
                placeholderTextColor={colors.textGray}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Loại công việc */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Loại công việc</Text>
              <View style={styles.tagContainer}>
                {jobTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() =>
                      setFormData({ ...formData, job_type: type.value as any })
                    }
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          formData.job_type === type.value
                            ? colors.primary
                            : colors.white,
                        borderColor:
                          formData.job_type === type.value
                            ? colors.primary
                            : colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color:
                            formData.job_type === type.value
                              ? colors.white
                              : colors.textDark,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cấp độ kinh nghiệm */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Cấp độ kinh nghiệm</Text>
              <View style={styles.tagContainer}>
                {experienceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        experience_level: level.value as any,
                      })
                    }
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          formData.experience_level === level.value
                            ? colors.primary
                            : colors.white,
                        borderColor:
                          formData.experience_level === level.value
                            ? colors.primary
                            : colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color:
                            formData.experience_level === level.value
                              ? colors.white
                              : colors.textDark,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Nhóm kỹ năng */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Nhóm kỹ năng (chọn nhiều)</Text>
              <View style={styles.tagContainer}>
                {skillCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => toggleCategory(cat.value)}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: selectedCategories.includes(cat.value)
                          ? colors.primary
                          : colors.white,
                        borderColor: selectedCategories.includes(cat.value)
                          ? colors.primary
                          : colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color: selectedCategories.includes(cat.value)
                            ? colors.white
                            : colors.textDark,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kỹ năng trong nhóm */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>
                Ngôn ngữ / Kỹ năng trong nhóm (chọn nhiều)
              </Text>
              {selectedCategories.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.textGray }}>
                  Hãy chọn ít nhất một nhóm kỹ năng.
                </Text>
              ) : skills.length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.textGray }}>
                  Chưa có kỹ năng nào trong các nhóm này.
                </Text>
              ) : (
                <View style={styles.tagContainer}>
                  {skills.map((skill) => (
                    <TouchableOpacity
                      key={skill.id}
                      onPress={() => toggleSkill(skill.id)}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: selectedSkillIds.includes(skill.id)
                            ? colors.primary
                            : colors.white,
                          borderColor: selectedSkillIds.includes(skill.id)
                            ? colors.primary
                            : colors.borderLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: selectedSkillIds.includes(skill.id)
                              ? colors.white
                              : colors.textDark,
                          },
                        ]}
                      >
                        {skill.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Lương */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Khoảng lương</Text>
              <View style={styles.salaryRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Tối thiểu"
                    keyboardType="numeric"
                    value={formatCurrency(formData.salary_min)}
                    onChangeText={(text) =>
                      handleSalaryChange(text, "salary_min")
                    }
                    placeholderTextColor={colors.textGray}
                  />
                </View>
                <Text style={styles.salarySeparator}>-</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Tối đa"
                    keyboardType="numeric"
                    value={formatCurrency(formData.salary_max)}
                    onChangeText={(text) =>
                      handleSalaryChange(text, "salary_max")
                    }
                    placeholderTextColor={colors.textGray}
                  />
                </View>
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textDark,
                    alignSelf: "center",
                  }}
                >
                  VNĐ
                </Text>
              </View>
            </View>

            {/* Hạn chót */}
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Hạn chót ứng tuyển *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
                value={formData.deadline}
                onChangeText={handleDeadlineChange}
                placeholderTextColor={colors.textGray}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: submitting ? "#ccc" : colors.primary,
                  },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {jobId ? "Cập nhật" : "Đăng tin"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </EmployerSidebarLayout>
  );
}

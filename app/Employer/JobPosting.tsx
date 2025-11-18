import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/theme';
import { authService } from '../../lib/services/authService';
import { employerService } from '../../lib/services/employerService';
import { jobService } from '../../lib/services/jobService';
import EmployerSidebarLayout from '../Component/EmployerSidebarLayout';

export default function JobPostingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = useState(!!jobId);
  const [submitting, setSubmitting] = useState(false);
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full-time' as 'full-time' | 'part-time' | 'internship' | 'remote' | 'hybrid',
    experience_level: 'mid' as 'junior' | 'mid' | 'senior',
    salary_min: '',
    salary_max: '',
    salary_currency: 'VND',
    deadline: '',
  });

  const jobTypes = [
    { label: 'Toàn thời gian', value: 'full-time' },
    { label: 'Bán thời gian', value: 'part-time' },
    { label: 'Thực tập', value: 'internship' },
    { label: 'Làm việc từ xa', value: 'remote' },
    { label: 'Kết hợp', value: 'hybrid' },
  ];

  const experienceLevels = [
    { label: 'Người mới', value: 'junior' },
    { label: 'Trung cấp', value: 'mid' },
    { label: 'Cao cấp', value: 'senior' },
  ];

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/(auth)/login');
        return;
      }

      const employer = await employerService.getEmployerProfile(user.id);
      if (employer?.id && employer.company_id) {
        setEmployerId(employer.id);
        setCompanyId(employer.company_id);

        // Nếu là chỉnh sửa, lấy dữ liệu công việc
        if (jobId) {
          const job = await jobService.getJobById(jobId);
          if (job) {
            setFormData({
              title: job.title || '',
              description: job.description || '',
              requirements: job.requirements || '',
              location: job.location || '',
              job_type: job.job_type || 'full-time',
              experience_level: job.experience_level || 'mid',
              salary_min: job.salary_min?.toString() || '',
              salary_max: job.salary_max?.toString() || '',
              salary_currency: job.salary_currency || 'VND',
              deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!formData.title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc');
        return;
      }
      if (!formData.description.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc');
        return;
      }
      if (!employerId || !companyId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin nhà tuyển dụng');
        return;
      }

      // Validate salary range if both provided
      if (formData.salary_min && formData.salary_max) {
        if (parseInt(formData.salary_min) > parseInt(formData.salary_max)) {
          Alert.alert('Lỗi', 'Lương tối thiểu không được lớn hơn lương tối đa');
          return;
        }
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
        deadline: formData.deadline ? `${formData.deadline}T23:59:59+00:00` : null,
        is_active: true,
      };

      if (jobId) {
        // Cập nhật
        await jobService.updateJob(jobId, jobData);
        Alert.alert('Thành công', 'Cập nhật tin tuyển dụng thành công', [
          { text: 'OK', onPress: () => router.push('/Employer/JobApplication') },
        ]);
      } else {
        // Tạo mới
        await jobService.createJob(jobData);
        Alert.alert('Thành công', 'Tạo tin tuyển dụng thành công', [
          { text: 'OK', onPress: () => router.push('/Employer/JobApplication') },
        ]);
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      Alert.alert('Lỗi', 'Có lỗi khi lưu tin tuyển dụng: ' + (error as any)?.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={28}
                  color={colors.white}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.white,
                }}
              >
                {jobId ? 'Chỉnh sửa tin' : 'Đăng tin tuyển dụng'}
              </Text>
              <View style={{ width: 28 }} />
            </View>
          </View>

          {/* Form */}
          <View style={{ padding: 16 }}>
            {/* Tiêu đề */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Tiêu đề công việc *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
                placeholder="Ví dụ: React Native Developer"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            {/* Mô tả công việc */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Mô tả công việc *
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                multiline
                numberOfLines={5}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {/* Yêu cầu */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Yêu cầu công việc
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Liệt kê các yêu cầu kỹ năng, kinh nghiệm..."
                multiline
                numberOfLines={4}
                value={formData.requirements}
                onChangeText={(text) => setFormData({ ...formData, requirements: text })}
              />
            </View>

            {/* Địa điểm */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Địa điểm làm việc
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            {/* Loại công việc */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Loại công việc
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {jobTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setFormData({ ...formData, job_type: type.value as any })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        formData.job_type === type.value ? colors.primary : colors.white,
                      borderWidth: 1,
                      borderColor:
                        formData.job_type === type.value ? colors.primary : colors.borderLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color:
                          formData.job_type === type.value ? colors.white : colors.textDark,
                      }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cấp độ kinh nghiệm */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Cấp độ kinh nghiệm
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {experienceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setFormData({ ...formData, experience_level: level.value as any })}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        formData.experience_level === level.value ? colors.primary : colors.white,
                      borderWidth: 1,
                      borderColor:
                        formData.experience_level === level.value ? colors.primary : colors.borderLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color:
                          formData.experience_level === level.value ? colors.white : colors.textDark,
                      }}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lương */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Khoảng lương
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 14,
                      color: colors.textDark,
                    }}
                    placeholder="Tối thiểu"
                    keyboardType="numeric"
                    value={formData.salary_min}
                    onChangeText={(text) => setFormData({ ...formData, salary_min: text })}
                  />
                </View>
                <Text style={{ color: colors.textGray }}>-</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 14,
                      color: colors.textDark,
                    }}
                    placeholder="Tối đa"
                    keyboardType="numeric"
                    value={formData.salary_max}
                    onChangeText={(text) => setFormData({ ...formData, salary_max: text })}
                  />
                </View>
              </View>
            </View>

            {/* Hạn chót */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 }}>
                Hạn chót ứng tuyển
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textDark,
                }}
                placeholder="YYYY-MM-DD"
                value={formData.deadline}
                onChangeText={(text) => setFormData({ ...formData, deadline: text })}
              />
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark }}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: submitting ? '#ccc' : colors.primary,
                  alignItems: 'center',
                }}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                    {jobId ? 'Cập nhật' : 'Đăng tin'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </EmployerSidebarLayout>
  );
}

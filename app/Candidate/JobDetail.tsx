import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../constants/theme';
import { jobService } from '../../lib/services/jobService';
import SidebarLayout from '../Component/SidebarLayout';

interface JobDetail {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  view_count: number;
  deadline: string;
  is_active: boolean;
  companies?: {
    name: string;
    industry?: string;
    size?: string;
    logo_url?: string;
  };
}

export default function JobDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId ? parseInt(params.jobId as string) : null;

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<JobDetail | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (jobId) {
      loadJobDetail();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(jobId!);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết công việc');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      return num.toLocaleString('vi-VN');
    };
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không xác định';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const handleShare = async () => {
    if (!job) return;
    try {
      await Share.share({
        message: `Công việc: ${job.title}\nCông ty: ${job.companies?.name}\nMức lương: ${formatSalary(job.salary_min, job.salary_max, job.salary_currency)}\nĐịa điểm: ${job.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </SidebarLayout>
    );
  }

  if (!job) {
    return (
      <SidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <MaterialCommunityIcons name="alert-circle" size={48} color={colors.textGray} />
            <Text style={{ fontSize: 16, color: colors.textDark, marginTop: 12, textAlign: 'center' }}>
              Không tìm thấy công việc
            </Text>
          </View>
        </SafeAreaView>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.white,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textDark }}>
            Chi tiết công việc
          </Text>
          <TouchableOpacity onPress={handleShare}>
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Job Header Info */}
          <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: colors.textDark,
                    marginBottom: 4,
                  }}
                >
                  {job.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textGray,
                    marginBottom: 8,
                  }}
                >
                  {job.companies?.name || 'Công ty'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSaved(!isSaved)}
                style={{
                  padding: 8,
                }}
              >
                <MaterialCommunityIcons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isSaved ? '#E63946' : colors.textGray}
                />
              </TouchableOpacity>
            </View>

            {/* Quick Info */}
            <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primarySoftBg,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={16}
                  color={colors.primary}
                />
                <Text style={{ fontSize: 12, color: colors.textDark, marginLeft: 4 }}>
                  {job.view_count} lượt xem
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: job.is_active ? '#E8F5E9' : '#FFEBEE',
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <MaterialCommunityIcons
                  name={job.is_active ? 'check-circle' : 'close-circle'}
                  size={16}
                  color={job.is_active ? '#2E7D32' : '#C62828'}
                />
                <Text style={{ fontSize: 12, color: job.is_active ? '#2E7D32' : '#C62828', marginLeft: 4 }}>
                  {job.is_active ? 'Đang tuyển' : 'Đóng'}
                </Text>
              </View>
            </View>

            {/* Salary & Location */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="cash"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.primary,
                    marginLeft: 8,
                  }}
                >
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textDark,
                    marginLeft: 8,
                  }}
                >
                  {job.location}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="clock"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textGray,
                    marginLeft: 8,
                  }}
                >
                  Hạn: {formatDate(job.deadline)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              Mô tả công việc
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textGray,
                lineHeight: 20,
              }}
            >
              {job.description}
            </Text>
          </View>

          {/* Requirements */}
          <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.textDark,
                marginBottom: 12,
              }}
            >
              Yêu cầu công việc
            </Text>
            {job.requirements && job.requirements.split('\n').map((req: string, idx: number) => (
              req.trim() && (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: colors.textDark,
                      lineHeight: 18,
                    }}
                  >
                    {req}
                  </Text>
                </View>
              )
            ))}
          </View>

          {/* Job Type & Experience */}
          <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.textDark,
                marginBottom: 12,
              }}
            >
              Thông tin bổ sung
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: colors.textGray, flex: 1 }}>
                Loại công việc
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textDark }}>
                {job.job_type}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 12, color: colors.textGray, flex: 1 }}>
                Cấp độ kinh nghiệm
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textDark }}>
                {job.experience_level}
              </Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textGray,
                    marginBottom: 4,
                  }}
                >
                  Ngành nghề
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textDark,
                  }}
                >
                  {job.companies?.industry || 'Không xác định'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={{ padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: colors.shadowLight,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.white,
              }}
            >
              Ứng tuyển ngay
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SidebarLayout>
  );
}

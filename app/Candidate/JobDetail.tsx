import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
    SafeAreaView,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/theme';
import SidebarLayout from '../Component/SidebarLayout';

interface JobDetail {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  rating?: number;
  description: string;
  requirements: string[];
  benefits: string[];
  experience: string;
  jobType: string;
  postedDate: string;
}

const JOBS_DATA: { [key: string]: JobDetail } = {
  '1': {
    id: '1',
    title: 'Senior React Native Developer',
    company: 'Tech Company A',
    salary: '20 - 30 triệu',
    location: 'TP. Hồ Chí Minh',
    rating: 4.5,
    experience: '3+ năm',
    jobType: 'Toàn thời gian',
    postedDate: '2 ngày trước',
    description:
      'Chúng tôi đang tìm kiếm một Senior React Native Developer có kinh nghiệm để tham gia vào dự án phát triển ứng dụng di động cho iOS và Android. Bạn sẽ làm việc với một nhóm chuyên nghiệp trong một môi trường năng động và sáng tạo.',
    requirements: [
      'Kinh nghiệm 3+ năm làm việc với React Native',
      'Thành thạo JavaScript/TypeScript',
      'Hiểu biết về Firebase, Redux',
      'Khả năng làm việc nhóm tốt',
      'Tiếng Anh giao tiếp được',
    ],
    benefits: [
      'Mức lương cạnh tranh từ 20-30 triệu/tháng',
      'Bảo hiểm y tế đầy đủ',
      'Phép năm, thưởng tết',
      'Môi trường làm việc chuyên nghiệp',
      'Cơ hội phát triển sự nghiệp',
    ],
  },
  '2': {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Startup XYZ',
    salary: '15 - 25 triệu',
    location: 'Hà Nội',
    rating: 4.2,
    experience: '2+ năm',
    jobType: 'Toàn thời gian',
    postedDate: '5 ngày trước',
    description:
      'Startup công nghệ đang phát triển nhanh chóng tìm kiếm Full Stack Developer. Bạn sẽ tham gia vào xây dựng hệ thống backend và frontend cho các sản phẩm dịch vụ của công ty.',
    requirements: [
      'Kinh nghiệm 2+ năm với Node.js, React',
      'Thông hiểu cơ sở dữ liệu',
      'Có kinh nghiệm với REST API',
      'Kỹ năng giải quyết vấn đề tốt',
    ],
    benefits: [
      'Lương 15-25 triệu/tháng',
      'Công ty startup năng động',
      'Cơ hội học hỏi nhanh',
      'Cú gi gian làm việc linh hoạt',
    ],
  },
  '3': {
    id: '3',
    title: 'Mobile App Developer',
    company: 'Tech Company B',
    salary: '18 - 28 triệu',
    location: 'Đà Nẵng',
    rating: 4.8,
    experience: '2+ năm',
    jobType: 'Toàn thời gian',
    postedDate: '1 ngày trước',
    description:
      'Công ty công nghệ hàng đầu cần tuyển dụng Mobile App Developer để phát triển ứng dụng di động. Bạn sẽ làm việc với công nghệ mới nhất và đội ngũ kỹ sư giỏi.',
    requirements: [
      'Kinh nghiệm phát triển ứng dụng mobile',
      'Biết lập trình Swift hoặc Kotlin',
      'Hiểu biết về UI/UX',
      'Có thể làm việc độc lập',
    ],
    benefits: [
      'Mức lương hấp dẫn 18-28 triệu',
      'Bảo hiểm y tế',
      'Môi trường làm việc tốt',
      'Hỗ trợ phát triển kỹ năng',
    ],
  },
};

export default function JobDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const job = JOBS_DATA[jobId] || JOBS_DATA['1'];
  const [isSaved, setIsSaved] = React.useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Công việc: ${job.title}\nCông ty: ${job.company}\nMức lương: ${job.salary}\nĐịa điểm: ${job.location}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

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
                {job.company}
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
                name="star"
                size={16}
                color="#FFC107"
              />
              <Text style={{ fontSize: 12, color: colors.textDark, marginLeft: 4 }}>
                {job.rating}
              </Text>
            </View>
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
                name="briefcase"
                size={16}
                color={colors.primary}
              />
              <Text style={{ fontSize: 12, color: colors.textDark, marginLeft: 4 }}>
                {job.jobType}
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
                {job.salary}
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
                {job.postedDate}
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
          {job.requirements.map((req, idx) => (
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
          ))}
        </View>

        {/* Benefits */}
        <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textDark,
              marginBottom: 12,
            }}
          >
            Quyền lợi công nhân viên
          </Text>
          {job.benefits.map((benefit, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <MaterialCommunityIcons
                name="star"
                size={18}
                color="#FFC107"
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
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={{ backgroundColor: colors.white, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginBottom: 4,
                }}
              >
                Kinh nghiệm yêu cầu
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.textDark,
                }}
              >
                {job.experience}
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

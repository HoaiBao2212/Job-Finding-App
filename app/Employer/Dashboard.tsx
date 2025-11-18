import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../../constants/theme';
import { authService } from '../../lib/services/authService';
import { employerService } from '../../lib/services/employerService';
import { jobService } from '../../lib/services/jobService';
import EmployerSidebarLayout from '../Component/EmployerSidebarLayout';

interface StatCard {
  id: string;
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface JobPosting {
  id: string;
  title: string;
  applications: number;
  views: number;
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  applicantsCv: number;
}

interface RecentApplication {
  id: string;
  name: string;
  position: string;
  avatar: string;
  appliedDate: string;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected';
}

export default function ApplicantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'postings' | 'applications'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalApplied: 0,
    totalViews: 0,
  });
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [employerId, setEmployerId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/(auth)/login');
        return;
      }

      const employer = await employerService.getEmployerProfile(user.id);
      if (employer?.id) {
        setEmployerId(employer.id);
        
        // Lấy thống kê công việc
        const jobStats = await employerService.getJobStats(employer.id);
        setStats(jobStats);

        // Lấy danh sách công việc
        const jobs = await jobService.getEmployerJobs(employer.id);
        setJobPostings(jobs.slice(0, 3)); // Lấy 3 công việc gần nhất
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultStats: StatCard[] = [
    {
      id: '1',
      icon: 'briefcase',
      label: 'Tin tuyển dụng',
      value: stats.total,
      color: colors.primary,
      bgColor: '#E7F5FF',
    },
    {
      id: '2',
      icon: 'file-document-multiple',
      label: 'Hồ sơ nhận được',
      value: stats.totalApplied,
      color: '#52C41A',
      bgColor: '#F6FFED',
    },
    {
      id: '3',
      icon: 'eye',
      label: 'Lượt xem',
      value: stats.totalViews,
      color: '#FF7A45',
      bgColor: '#FFF7E6',
    },
    {
      id: '4',
      icon: 'trending-up',
      label: 'Tỷ lệ ứng tuyển',
      value: stats.total > 0 ? Math.round((stats.totalApplied / stats.total) * 100) : 0,
      color: '#722ED1',
      bgColor: '#F9F0FF',
    },
  ];

  // Dữ liệu giả để hiển thị khi không có dữ liệu từ API
  const displayJobPostings: JobPosting[] = jobPostings.slice(0, 3).map((job) => ({
    id: job.id?.toString() || '',
    title: job.title || '',
    applications: 0,
    views: job.view_count || 0,
    status: job.is_active ? 'active' : 'closed',
    postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : '',
    applicantsCv: 0,
  }));

  const displayJobPostingsDefault: JobPosting[] = [
    {
      id: '1',
      title: 'React Native Developer',
      applications: 24,
      views: 320,
      status: 'active',
      postedDate: '5 ngày trước',
      applicantsCv: 18,
    },
    {
      id: '2',
      title: 'UI/UX Designer',
      applications: 16,
      views: 280,
      status: 'active',
      postedDate: '12 ngày trước',
      applicantsCv: 12,
    },
    {
      id: '3',
      title: 'Backend Developer',
      applications: 8,
      views: 185,
      status: 'closed',
      postedDate: '30 ngày trước',
      applicantsCv: 7,
    },
  ];

  const displayRecentApplications: RecentApplication[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      position: 'React Native Developer',
      avatar: 'https://i.pravatar.cc/150?img=1',
      appliedDate: 'Hôm nay',
      status: 'new',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      position: 'UI/UX Designer',
      avatar: 'https://i.pravatar.cc/150?img=2',
      appliedDate: 'Hôm qua',
      status: 'reviewing',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      position: 'React Native Developer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      appliedDate: '2 ngày trước',
      status: 'accepted',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#F6FFED', text: '#52C41A', label: 'Đang tuyển' };
      case 'closed':
        return { bg: '#FFF1F0', text: '#FF7875', label: 'Đã đóng' };
      case 'draft':
        return { bg: '#F5F5F5', text: '#8C8C8C', label: 'Nháp' };
      case 'new':
        return { bg: '#E7F5FF', text: colors.primary, label: 'Mới' };
      case 'reviewing':
        return { bg: '#FFF7E6', text: '#FF7A45', label: 'Đang xem' };
      case 'accepted':
        return { bg: '#F6FFED', text: '#52C41A', label: 'Chấp nhận' };
      case 'rejected':
        return { bg: '#FFF1F0', text: '#FF7875', label: 'Từ chối' };
      default:
        return { bg: '#F5F5F5', text: '#8C8C8C', label: 'Khác' };
    }
  };

  const StatCard = ({ item }: { item: StatCard }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: item.bgColor,
        borderRadius: 12,
        padding: 16,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={24}
        color={item.color}
        style={{ marginBottom: 8 }}
      />
      <Text style={{ fontSize: 20, fontWeight: '700', color: item.color }}>
        {item.value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textGray,
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const JobPostingCard = ({ item }: { item: JobPosting }) => {
    const statusInfo = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderLight,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textDark }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginTop: 4,
              }}
            >
              Đăng {item.postedDate}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: statusInfo.bg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: statusInfo.text,
              }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="file-document"
              size={16}
              color={colors.primary}
              style={{ marginBottom: 4 }}
            />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textDark }}>
              {item.applicantsCv}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textGray }}>CV</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#52C41A"
              style={{ marginBottom: 4 }}
            />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textDark }}>
              {item.applications}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textGray }}>Ứng tuyển</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="eye"
              size={16}
              color="#FF7A45"
              style={{ marginBottom: 4 }}
            />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textDark }}>
              {item.views}
            </Text>
            <Text style={{ fontSize: 10, color: colors.textGray }}>Lượt xem</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ApplicationCard = ({ item }: { item: RecentApplication }) => {
    const statusInfo = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderLight,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      >
        <Image
          source={{ uri: item.avatar }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textDark }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textGray, marginTop: 2 }}>
            {item.position}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.textGray,
              marginTop: 4,
            }}
          >
            {item.appliedDate}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: statusInfo.bg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: statusInfo.text,
            }}
          >
            {statusInfo.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.white }}>
                Xin chào! 👋
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#E3F2FD',
                  marginTop: 4,
                }}
              >
                Nhà tuyển dụng ABC Company
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={{ paddingHorizontal: 16, marginTop: -12, marginBottom: 20 }}>
          <FlatList
            data={defaultStats}
            renderItem={({ item }) => <StatCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          {(['overview', 'postings', 'applications'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderBottomWidth: activeTab === tab ? 3 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: activeTab === tab ? '700' : '500',
                  color:
                    activeTab === tab ? colors.primary : colors.textGray,
                }}
              >
                {tab === 'overview'
                  ? 'Tổng quan'
                  : tab === 'postings'
                  ? 'Tin tuyển'
                  : 'Ứng tuyển'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {activeTab === 'overview' && (
            <View>
              {/* Quick Actions */}
              <View
                style={{
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.textDark,
                    marginBottom: 12,
                  }}
                >
                  Thao tác nhanh
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/Employer/JobApplication')}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginBottom: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={colors.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Đăng tin tuyển dụng
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Recent Applications */}
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: colors.textDark,
                    }}
                  >
                    Ứng tuyển gần đây
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/Employer/JobApplication')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: colors.primary,
                      }}
                    >
                      Xem tất cả
                    </Text>
                  </TouchableOpacity>
                </View>
                {displayRecentApplications.map((app) => (
                  <ApplicationCard key={app.id} item={app} />
                ))}
              </View>
            </View>
          )}

          {activeTab === 'postings' && (
            <View>
              <View
                style={{
                  marginBottom: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.textDark,
                  }}
                >
                  Tin tuyển dụng của bạn
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/Employer/JobApplication')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
              {jobPostings.map((job) => (
                <JobPostingCard key={job.id} item={job} />
              ))}
            </View>
          )}

          {activeTab === 'applications' && (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: colors.textDark,
                  marginBottom: 12,
                }}
              >
                Tất cả ứng tuyển
              </Text>
              {displayRecentApplications.map((app) => (
                <ApplicationCard key={app.id} item={app} />
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </SafeAreaView>
    </EmployerSidebarLayout>
  );
}

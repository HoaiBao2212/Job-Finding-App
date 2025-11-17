import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../../constants/theme';
import ApplicantSidebarLayout from '../Component/ApplicantSidebarLayout';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  applications: number;
  views: number;
  status: 'active' | 'closed' | 'draft';
  createdDate: string;
  deadline: string;
  level: 'entry' | 'mid' | 'senior';
  applicantsCv: number;
  description: string;
}

export default function JobApplicationScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'applications'>('newest');

  const jobPostings: JobPosting[] = [
    {
      id: '1',
      title: 'React Native Developer',
      company: 'ABC Company',
      location: 'TP. Hồ Chí Minh',
      salary: '15 - 25 triệu',
      applications: 24,
      views: 320,
      status: 'active',
      createdDate: '5 ngày trước',
      deadline: '15/12/2025',
      level: 'mid',
      applicantsCv: 18,
      description: 'Tuyển dụng React Native Developer có kinh nghiệm 2+ năm',
    },
    {
      id: '2',
      title: 'UI/UX Designer',
      company: 'XYZ Creative',
      location: 'Hà Nội',
      salary: '12 - 20 triệu',
      applications: 16,
      views: 280,
      status: 'active',
      createdDate: '12 ngày trước',
      deadline: '20/12/2025',
      level: 'mid',
      applicantsCv: 12,
      description: 'Tìm kiếm UI/UX Designer sáng tạo và chuyên nghiệp',
    },
    {
      id: '3',
      title: 'Backend Developer',
      company: 'Tech Solutions',
      location: 'TP. Hồ Chí Minh',
      salary: '18 - 30 triệu',
      applications: 8,
      views: 185,
      status: 'closed',
      createdDate: '30 ngày trước',
      deadline: '10/11/2025',
      level: 'senior',
      applicantsCv: 7,
      description: 'Backend Developer Node.js/Python có kinh nghiệm',
    },
    {
      id: '4',
      title: 'Frontend Developer',
      company: 'Web Studio',
      location: 'Đà Nẵng',
      salary: '10 - 18 triệu',
      applications: 32,
      views: 450,
      status: 'active',
      createdDate: '2 ngày trước',
      deadline: '25/12/2025',
      level: 'entry',
      applicantsCv: 28,
      description: 'Tuyển Frontend Developer sử dụng React/Vue',
    },
    {
      id: '5',
      title: 'Project Manager',
      company: 'Business Corp',
      location: 'TP. Hồ Chí Minh',
      salary: '20 - 35 triệu',
      applications: 5,
      views: 120,
      status: 'draft',
      createdDate: 'Hôm nay',
      deadline: '30/12/2025',
      level: 'senior',
      applicantsCv: 0,
      description: 'Project Manager quản lý team IT',
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
      default:
        return { bg: '#F5F5F5', text: '#8C8C8C', label: 'Khác' };
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'entry':
        return 'Người mới';
      case 'mid':
        return 'Trung cấp';
      case 'senior':
        return 'Cao cấp';
      default:
        return 'Khác';
    }
  };

  const filteredJobs = jobPostings
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return parseInt(b.id) - parseInt(a.id);
      } else if (sortBy === 'popular') {
        return b.views - a.views;
      } else if (sortBy === 'applications') {
        return b.applications - a.applications;
      }
      return 0;
    });

  const statistics = {
    total: jobPostings.length,
    active: jobPostings.filter((j) => j.status === 'active').length,
    closed: jobPostings.filter((j) => j.status === 'closed').length,
    draft: jobPostings.filter((j) => j.status === 'draft').length,
    totalApplications: jobPostings.reduce((sum, j) => sum + j.applications, 0),
    totalViews: jobPostings.reduce((sum, j) => sum + j.views, 0),
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.textDark,
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: colors.textGray,
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );

  const JobCard = ({ item }: { item: JobPosting }) => {
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
        {/* Header */}
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
                fontSize: 14,
                fontWeight: '700',
                color: colors.textDark,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                marginTop: 4,
              }}
            >
              {item.company} • {item.location}
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

        {/* Salary and Level */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>Mức lương</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.primary,
                marginTop: 4,
              }}
            >
              {item.salary}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>Cấp độ</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {getLevelLabel(item.level)}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: colors.textGray }}>Hạn chót</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.deadline}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="file-document"
              size={16}
              color={colors.primary}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.applicantsCv}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              CV
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#52C41A"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.applications}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Ứng tuyển
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="eye"
              size={16}
              color="#FF7A45"
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textDark,
                marginTop: 4,
              }}
            >
              {item.views}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.textGray,
              }}
            >
              Lượt xem
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: colors.primary,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.white,
              }}
            >
              Xem chi tiết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="delete"
              size={16}
              color="#FF7875"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ApplicantSidebarLayout>
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
              marginBottom: 12,
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
              Tin tuyển dụng
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <FlatList
            data={[
              {
                id: 'total',
                icon: 'briefcase',
                label: 'Tổng',
                value: statistics.total,
                color: '#E7F5FF',
              },
              {
                id: 'active',
                icon: 'check-circle',
                label: 'Đang tuyển',
                value: statistics.active,
                color: '#F6FFED',
              },
              {
                id: 'views',
                icon: 'eye',
                label: 'Lượt xem',
                value: statistics.totalViews,
                color: '#FFF7E6',
              },
              {
                id: 'apps',
                icon: 'file-document',
                label: 'Ứng tuyển',
                value: statistics.totalApplications,
                color: '#F9F0FF',
              },
            ]}
            renderItem={({ item }) => <StatCard {...item} />}
            keyExtractor={(item) => item.id}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Search and Filters */}
        <View
          style={{
            paddingHorizontal: 16,
            marginBottom: 20,
          }}
        >
          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.borderLight,
              paddingHorizontal: 12,
              marginBottom: 12,
              height: 44,
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.textGray}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Tìm tin tuyển dụng..."
              placeholderTextColor={colors.textGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.textDark,
              }}
            />
          </View>

          {/* Filter Tabs */}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 12,
            }}
          >
            {(['all', 'active', 'closed', 'draft'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor:
                    filterStatus === status ? colors.primary : colors.white,
                  borderWidth: 1,
                  borderColor:
                    filterStatus === status ? colors.primary : colors.borderLight,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color:
                      filterStatus === status ? colors.white : colors.textDark,
                  }}
                >
                  {status === 'all'
                    ? 'Tất cả'
                    : status === 'active'
                    ? 'Đang tuyển'
                    : status === 'closed'
                    ? 'Đã đóng'
                    : 'Nháp'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textGray }}>Sắp xếp:</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['newest', 'popular', 'applications'] as const).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  onPress={() => setSortBy(sort)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor:
                      sortBy === sort ? colors.primary : colors.white,
                    borderWidth: 1,
                    borderColor:
                      sortBy === sort ? colors.primary : colors.borderLight,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color:
                        sortBy === sort ? colors.white : colors.textDark,
                    }}
                  >
                    {sort === 'newest'
                      ? 'Mới'
                      : sort === 'popular'
                      ? 'Phổ biến'
                      : 'Ứng tuyển'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Job List */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
        >
          {filteredJobs.length > 0 ? (
            <>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textGray,
                  marginBottom: 12,
                }}
              >
                Tìm thấy {filteredJobs.length} tin tuyển dụng
              </Text>
              {filteredJobs.map((job) => (
                <JobCard key={job.id} item={job} />
              ))}
            </>
          ) : (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 40,
              }}
            >
              <MaterialCommunityIcons
                name="briefcase-search"
                size={48}
                color={colors.textGray}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.textDark,
                }}
              >
                Không tìm thấy tin tuyển dụng
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </View>
          )}
        </View>
        </ScrollView>
      </SafeAreaView>
    </ApplicantSidebarLayout>
  );
}

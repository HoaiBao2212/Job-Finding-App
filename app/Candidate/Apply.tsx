import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/theme';
import SidebarLayout from '../Component/SidebarLayout';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  salary: string;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  statusVn: string;
  coverLetter?: string;
}

const APPLICATIONS: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior React Native Developer',
    company: 'Tech Company A',
    salary: '20 - 30 triệu',
    location: 'TP. Hồ Chí Minh',
    appliedDate: '5 ngày trước',
    status: 'reviewed',
    statusVn: 'Đã xem',
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Full Stack Developer',
    company: 'Startup XYZ',
    salary: '15 - 25 triệu',
    location: 'Hà Nội',
    appliedDate: '3 ngày trước',
    status: 'pending',
    statusVn: 'Đang chờ',
  },
  {
    id: '3',
    jobId: '3',
    jobTitle: 'Mobile App Developer',
    company: 'Tech Company B',
    salary: '18 - 28 triệu',
    location: 'Đà Nẵng',
    appliedDate: '1 ngày trước',
    status: 'accepted',
    statusVn: 'Chấp nhận',
  },
  {
    id: '4',
    jobId: '1',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio',
    salary: '12 - 18 triệu',
    location: 'TP. Hồ Chí Minh',
    appliedDate: '7 ngày trước',
    status: 'rejected',
    statusVn: 'Từ chối',
  },
];

export default function ApplyScreen() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'reviewed':
        return '#4169E1';
      case 'accepted':
        return '#00B050';
      case 'rejected':
        return '#E63946';
      default:
        return colors.textGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'reviewed':
        return 'eye';
      case 'accepted':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredApplications = filterStatus
    ? APPLICATIONS.filter((app) => app.status === filterStatus)
    : APPLICATIONS;

  const ApplicationCard = ({ item }: { item: Application }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/Candidate/JobDetail',
        params: { id: item.jobId }
      } as any)}
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status),
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: colors.shadowLight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textDark, marginBottom: 4 }}>
            {item.jobTitle}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textGray, marginBottom: 4 }}>
            {item.company}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: getStatusColor(item.status), paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={14}
            color="white"
            style={{ marginRight: 4 }}
          />
          <Text style={{ fontSize: 11, color: 'white', fontWeight: '600' }}>
            {item.statusVn}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.textGray, marginLeft: 4, marginRight: 16 }}>
            {item.location}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
          {item.salary}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
        <MaterialCommunityIcons name="calendar" size={14} color={colors.textGray} />
        <Text style={{ fontSize: 11, color: colors.textGray, marginLeft: 6 }}>
          Nộp {item.appliedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60 }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textDark, marginBottom: 8 }}>
              Đơn ứng tuyển 📝
            </Text>
            <Text style={{ fontSize: 14, color: colors.textGray }}>
              Quản lý các đơn ứng tuyển của bạn
            </Text>
          </View>

          {/* Stats */}
          <View
            style={{
              backgroundColor: colors.primarySoftBg,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="file-check" size={24} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}>
                Tổng số
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textDark, marginTop: 4 }}>
                {APPLICATIONS.length}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#00B050" />
              <Text style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}>
                Chấp nhận
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textDark, marginTop: 4 }}>
                {APPLICATIONS.filter((a) => a.status === 'accepted').length}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#FFA500" />
              <Text style={{ fontSize: 12, color: colors.textGray, marginTop: 8 }}>
                Chờ xử lý
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textDark, marginTop: 4 }}>
                {APPLICATIONS.filter((a) => a.status === 'pending').length}
              </Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            <TouchableOpacity
              onPress={() => setFilterStatus(null)}
              style={{
                backgroundColor: !filterStatus ? colors.primary : colors.white,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 12,
                borderWidth: !filterStatus ? 0 : 1,
                borderColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  color: !filterStatus ? colors.white : colors.textDark,
                  fontWeight: '500',
                  fontSize: 13,
                }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {[
              { status: 'pending', label: 'Chờ xử lý', icon: 'clock-outline' },
              { status: 'reviewed', label: 'Đã xem', icon: 'eye' },
              { status: 'accepted', label: 'Chấp nhận', icon: 'check-circle' },
              { status: 'rejected', label: 'Từ chối', icon: 'close-circle' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.status}
                onPress={() => setFilterStatus(filter.status)}
                style={{
                  backgroundColor: filterStatus === filter.status ? colors.primarySoftBg : colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: filterStatus === filter.status ? colors.primary : colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name={filter.icon as any}
                    size={14}
                    color={filterStatus === filter.status ? colors.primary : colors.textGray}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: filterStatus === filter.status ? colors.primary : colors.textDark,
                      fontWeight: filterStatus === filter.status ? '600' : '500',
                      fontSize: 13,
                    }}
                  >
                    {filter.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <FlatList
              data={filteredApplications}
              renderItem={ApplicationCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          ) : (
            <View
              style={{
                paddingVertical: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={48}
                color={colors.textGray}
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.textDark,
                  marginBottom: 8,
                }}
              >
                Không có đơn ứng tuyển
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textGray,
                  textAlign: 'center',
                }}
              >
                Hãy tìm và ứng tuyển các công việc phù hợp
              </Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </SidebarLayout>
  );
}

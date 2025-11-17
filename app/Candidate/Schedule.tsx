import { MaterialCommunityIcons } from '@expo/vector-icons';
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

interface InterviewSchedule {
  id: string;
  jobTitle: string;
  company: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'online' | 'offline';
  location?: string;
  interviewerName: string;
  interviewerTitle: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  statusVn: string;
  notes?: string;
}

const INTERVIEW_SCHEDULES: InterviewSchedule[] = [
  {
    id: '1',
    jobTitle: 'Senior React Native Developer',
    company: 'Tech Company A',
    interviewDate: '20/11/2025',
    interviewTime: '10:00 - 11:00',
    interviewType: 'online',
    location: 'Google Meet',
    interviewerName: 'Nguyễn Thị B',
    interviewerTitle: 'HR Manager',
    status: 'scheduled',
    statusVn: 'Sắp diễn ra',
    notes: 'Chuẩn bị CV và portfolio',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Developer',
    company: 'Startup XYZ',
    interviewDate: '22/11/2025',
    interviewTime: '14:00 - 15:30',
    interviewType: 'offline',
    location: 'Tầng 5, Tòa nhà ABC, Quận 1, TP.HCM',
    interviewerName: 'Trần Văn C',
    interviewerTitle: 'Tech Lead',
    status: 'scheduled',
    statusVn: 'Sắp diễn ra',
    notes: 'Mang theo bằng cấp và chứng chỉ',
  },
  {
    id: '3',
    jobTitle: 'Mobile App Developer',
    company: 'Tech Company B',
    interviewDate: '18/11/2025',
    interviewTime: '09:00 - 10:00',
    interviewType: 'online',
    location: 'Zoom',
    interviewerName: 'Lê Thị D',
    interviewerTitle: 'Hiring Manager',
    status: 'completed',
    statusVn: 'Hoàn thành',
  },
  {
    id: '4',
    jobTitle: 'UI/UX Designer',
    company: 'Design Studio',
    interviewDate: '15/11/2025',
    interviewTime: '16:00 - 16:45',
    interviewType: 'offline',
    location: 'Tầng 3, Văn phòng Design Studio',
    interviewerName: 'Phạm Văn E',
    interviewerTitle: 'Design Director',
    status: 'cancelled',
    statusVn: 'Đã hủy',
    notes: 'Nhân viên bênh dự định reschedule',
  },
];

export default function ScheduleScreen() {
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#4169E1';
      case 'completed':
        return '#00B050';
      case 'cancelled':
        return '#E63946';
      default:
        return colors.textGray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'calendar-clock';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getDaysUntilInterview = (dateStr: string) => {
    const today = new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    const interviewDate = new Date(year, month - 1, day);
    const diffTime = interviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSchedules = filterStatus
    ? INTERVIEW_SCHEDULES.filter((s) => s.status === filterStatus)
    : INTERVIEW_SCHEDULES;

  const ScheduleCard = ({ item }: { item: InterviewSchedule }) => {
    const daysLeft = getDaysUntilInterview(item.interviewDate);

    return (
      <View
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
                fontSize: 16,
                fontWeight: '600',
                color: colors.textDark,
                marginBottom: 4,
              }}
            >
              {item.jobTitle}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textGray,
                marginBottom: 4,
              }}
            >
              {item.company}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <MaterialCommunityIcons
              name={getStatusIcon(item.status) as any}
              size={14}
              color="white"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: 11,
                color: 'white',
                fontWeight: '600',
              }}
            >
              {item.statusVn}
            </Text>
          </View>
        </View>

        {/* Interview Info */}
        <View
          style={{
            backgroundColor: colors.primarySoftBg,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textDark,
                marginRight: 16,
              }}
            >
              {item.interviewDate}
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textDark,
              }}
            >
              {item.interviewTime}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name={item.interviewType === 'online' ? 'video' : 'map-marker'}
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                flex: 1,
              }}
            >
              {item.location || item.interviewType}
            </Text>
          </View>

          {daysLeft > 0 && item.status === 'scheduled' && (
            <View
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.primary,
                  fontWeight: '600',
                }}
              >
                ⏰ Còn {daysLeft} ngày
              </Text>
            </View>
          )}
        </View>

        {/* Interviewer Info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primarySoftBg,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.textDark,
              }}
            >
              {item.interviewerName}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textGray,
                marginTop: 2,
              }}
            >
              {item.interviewerTitle}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                color: colors.textBlue,
                marginBottom: 4,
              }}
            >
              💡 Ghi chú:
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textGray,
                lineHeight: 16,
              }}
            >
              {item.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {item.status === 'scheduled' && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                Reschedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 6,
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
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              Lịch phỏng vấn 📅
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textGray,
              }}
            >
              Quản lý các cuộc phỏng vấn của bạn
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
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color={colors.primary}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginTop: 8,
                }}
              >
                Tổng số
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                {INTERVIEW_SCHEDULES.length}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color="#4169E1"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginTop: 8,
                }}
              >
                Sắp diễn ra
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                {INTERVIEW_SCHEDULES.filter((s) => s.status === 'scheduled')
                  .length}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#00B050"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textGray,
                  marginTop: 8,
                }}
              >
                Hoàn thành
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.textDark,
                  marginTop: 4,
                }}
              >
                {INTERVIEW_SCHEDULES.filter((s) => s.status === 'completed')
                  .length}
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
              { status: 'scheduled', label: 'Sắp diễn ra', icon: 'calendar-clock' },
              { status: 'completed', label: 'Hoàn thành', icon: 'check-circle' },
              { status: 'cancelled', label: 'Đã hủy', icon: 'close-circle' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.status}
                onPress={() => setFilterStatus(filter.status)}
                style={{
                  backgroundColor:
                    filterStatus === filter.status
                      ? colors.primarySoftBg
                      : colors.white,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor:
                    filterStatus === filter.status
                      ? colors.primary
                      : colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name={filter.icon as any}
                    size={14}
                    color={
                      filterStatus === filter.status
                        ? colors.primary
                        : colors.textGray
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color:
                        filterStatus === filter.status
                          ? colors.primary
                          : colors.textDark,
                      fontWeight:
                        filterStatus === filter.status ? '600' : '500',
                      fontSize: 13,
                    }}
                  >
                    {filter.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Schedules List */}
          {filteredSchedules.length > 0 ? (
            <FlatList
              data={filteredSchedules}
              renderItem={ScheduleCard}
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
                name="calendar-blank"
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
                Chưa có lịch phỏng vấn
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textGray,
                  textAlign: 'center',
                }}
              >
                Các lịch phỏng vấn sẽ xuất hiện ở đây
              </Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </SidebarLayout>
  );
}

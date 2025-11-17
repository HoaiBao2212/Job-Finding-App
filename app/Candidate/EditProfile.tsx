import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../../constants/theme';
import SidebarLayout from '../Component/SidebarLayout';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  location: string;
  bio: string;
  experience: string;
  education: string;
  skills: string;
  avatar: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<ProfileData>({
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84 912 345 678',
    jobTitle: 'React Native Developer',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    bio: 'Lập trình viên React Native với hơn 3 năm kinh nghiệm xây dựng ứng dụng mobile đa nền tảng.',
    experience: '3+ năm',
    education: 'Đại học Công nghệ Thông tin',
    skills: 'React Native, TypeScript, Firebase, REST API',
    avatar: 'https://i.pravatar.cc/150?img=32',
  });

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    if (!profile.fullName.trim() || !profile.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền tên và email');
      return;
    }

    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhập');
      router.back();
    }, 1500);
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    numberOfLines = 1,
    icon,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    numberOfLines?: number;
    icon: string;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <MaterialCommunityIcons
          name={icon as any}
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
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textGray}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={{
          backgroundColor: colors.white,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.borderLight,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 14,
          color: colors.textDark,
          fontFamily: 'System',
        }}
      />
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontSize: 16,
        fontWeight: '700',
        color: colors.textDark,
        marginBottom: 12,
        marginTop: 24,
      }}
    >
      {title}
    </Text>
  );

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

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
            Chỉnh sửa hồ sơ
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}
        >
          {/* Avatar Section */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <Image
              source={{ uri: profile.avatar }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 3,
                borderColor: colors.primary,
                marginBottom: 12,
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="camera"
                  size={16}
                  color={colors.white}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  Thay đổi ảnh
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <SectionTitle title="Thông tin cá nhân" />

          <InputField
            label="Họ và tên"
            value={profile.fullName}
            onChangeText={(text) =>
              setProfile({ ...profile, fullName: text })
            }
            placeholder="Nhập họ và tên"
            icon="account"
          />

          <InputField
            label="Email"
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Nhập email"
            icon="email"
          />

          <InputField
            label="Số điện thoại"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            placeholder="Nhập số điện thoại"
            icon="phone"
          />

          <InputField
            label="Vị trí công việc"
            value={profile.jobTitle}
            onChangeText={(text) =>
              setProfile({ ...profile, jobTitle: text })
            }
            placeholder="Nhập vị trí công việc"
            icon="briefcase"
          />

          <InputField
            label="Địa điểm"
            value={profile.location}
            onChangeText={(text) =>
              setProfile({ ...profile, location: text })
            }
            placeholder="Nhập địa điểm"
            icon="map-marker"
          />

          {/* Professional Information */}
          <SectionTitle title="Thông tin chuyên nghiệp" />

          <InputField
            label="Giới thiệu bản thân"
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            placeholder="Viết về bản thân bạn"
            icon="pencil"
            multiline
            numberOfLines={4}
          />

          <InputField
            label="Kinh nghiệm làm việc"
            value={profile.experience}
            onChangeText={(text) =>
              setProfile({ ...profile, experience: text })
            }
            placeholder="Nhập kinh nghiệm"
            icon="briefcase-outline"
          />

          <InputField
            label="Học vấn"
            value={profile.education}
            onChangeText={(text) =>
              setProfile({ ...profile, education: text })
            }
            placeholder="Nhập học vấn"
            icon="school"
          />

          <InputField
            label="Kỹ năng"
            value={profile.skills}
            onChangeText={(text) =>
              setProfile({ ...profile, skills: text })
            }
            placeholder="Nhập kỹ năng (cách nhau bằng dấu phẩy)"
            icon="star"
            multiline
            numberOfLines={3}
          />

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 24,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: colors.primary,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: 'center',
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name="loading"
                    size={16}
                    color={colors.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.white,
                    }}
                  >
                    Đang lưu...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.white,
                  }}
                >
                  Lưu thay đổi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SidebarLayout>
  );
}

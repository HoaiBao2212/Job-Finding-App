import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";
import AlertModal from "../Component/AlertModal";
import SidebarLayout from "../Component/SidebarLayout";
import { useAlert } from "../Component/useAlert.hook";

interface UserAccount {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  verificationStatus: "verified" | "unverified";
}

export default function AccountScreen() {
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlert();
  const [user, setUser] = React.useState<UserAccount>({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 912 345 678",
    avatar: "https://i.pravatar.cc/150?img=32",
    joinDate: "15/01/2024",
    verificationStatus: "verified",
  });

  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    jobAlerts: true,
    applicationUpdates: true,
  });

  const [privacy, setPrivacy] = React.useState({
    profilePublic: false,
    showOnlineStatus: true,
  });

  const handleLogout = () => {
    showAlert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => hideAlert(),
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Thực hiện đăng xuất Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
              showAlert("Lỗi", error.message);
              return;
            }

            // 2. Chuyển về màn login
            router.replace("/(auth)/login");
          } catch (err: any) {
            showAlert(
              "Lỗi",
              err?.message || "Không thể đăng xuất. Hãy thử lại."
            );
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    showAlert(
      "Xóa tài khoản",
      "Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.",
      [
        { text: "Hủy", style: "cancel", onPress: () => hideAlert() },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            console.log("Account deleted");
          },
        },
      ]
    );
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 12,
        marginTop: 20,
      }}
    >
      {title}
    </Text>
  );

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={colors.primary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: colors.textDark,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              color: colors.textGray,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {badge && (
        <View
          style={{
            backgroundColor: "#E63946",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: colors.white,
              fontWeight: "600",
            }}
          >
            {badge}
          </Text>
        </View>
      )}
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.textGray}
      />
    </TouchableOpacity>
  );

  const NotificationToggle = ({
    icon,
    title,
    value,
    onToggle,
  }: {
    icon: string;
    title: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={colors.primary}
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: "500",
          color: colors.textDark,
        }}
      >
        {title}
      </Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingTop: 60 }}
        >
          {/* User Profile Section */}
          <View
            style={{
              backgroundColor: colors.white,
              paddingHorizontal: 16,
              paddingVertical: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  marginBottom: 12,
                }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.textDark,
                  marginBottom: 4,
                }}
              >
                {user.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    user.verificationStatus === "verified"
                      ? "#E8F5E9"
                      : "#FFF3E0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <MaterialCommunityIcons
                  name={
                    user.verificationStatus === "verified"
                      ? "check-circle"
                      : "alert-circle"
                  }
                  size={14}
                  color={
                    user.verificationStatus === "verified"
                      ? "#2E7D32"
                      : "#F57C00"
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      user.verificationStatus === "verified"
                        ? "#2E7D32"
                        : "#F57C00",
                  }}
                >
                  {user.verificationStatus === "verified"
                    ? "Đã xác minh"
                    : "Chưa xác minh"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primarySoftBg,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                Chỉnh sửa hồ sơ
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Information */}
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Thông tin tài khoản" />

            {/* Edit Profile Button */}
            <TouchableOpacity
              onPress={() => router.push("/Candidate/EditProfile")}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 16,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: colors.white,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Chỉnh sửa hồ sơ
              </Text>
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textDark,
                    }}
                  >
                    {user.email}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 2,
                    }}
                  >
                    Số điện thoại
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textDark,
                    }}
                  >
                    {user.phone}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      marginBottom: 2,
                    }}
                  >
                    Ngày tham gia
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.textDark,
                    }}
                  >
                    {user.joinDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Thông báo" />

            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <NotificationToggle
                icon="email-outline"
                title="Thông báo qua Email"
                value={notifications.email}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    email: !notifications.email,
                  })
                }
              />
              <NotificationToggle
                icon="message-text-outline"
                title="Thông báo qua SMS"
                value={notifications.sms}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    sms: !notifications.sms,
                  })
                }
              />
              <NotificationToggle
                icon="briefcase-outline"
                title="Cảnh báo công việc"
                value={notifications.jobAlerts}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    jobAlerts: !notifications.jobAlerts,
                  })
                }
              />
              <NotificationToggle
                icon="file-check-outline"
                title="Cập nhật đơn ứng tuyển"
                value={notifications.applicationUpdates}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    applicationUpdates: !notifications.applicationUpdates,
                  })
                }
              />
            </View>
          </View>

          {/* Privacy & Security */}
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Bảo mật & Riêng tư" />

            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <SettingItem
                icon="lock-outline"
                title="Đổi mật khẩu"
                subtitle="Cập nhật mật khẩu của bạn"
              />
              <SettingItem
                icon="phone-lock-outline"
                title="Xác minh hai yếu tố"
                subtitle="Bảo vệ tài khoản của bạn"
              />
              <NotificationToggle
                icon="eye-outline"
                title="Hồ sơ công khai"
                value={privacy.profilePublic}
                onToggle={() =>
                  setPrivacy({
                    ...privacy,
                    profilePublic: !privacy.profilePublic,
                  })
                }
              />
              <NotificationToggle
                icon="wifi-outline"
                title="Hiển thị trạng thái online"
                value={privacy.showOnlineStatus}
                onToggle={() =>
                  setPrivacy({
                    ...privacy,
                    showOnlineStatus: !privacy.showOnlineStatus,
                  })
                }
              />
            </View>
          </View>

          {/* Support & Help */}
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Trợ giúp & Hỗ trợ" />

            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <SettingItem
                icon="help-circle-outline"
                title="Trung tâm trợ giúp"
                subtitle="Xem câu hỏi thường gặp"
              />
              <SettingItem
                icon="message-text-outline"
                title="Liên hệ hỗ trợ"
                subtitle="Gửi phản hồi hoặc báo cáo vấn đề"
              />
              <SettingItem
                icon="file-document-outline"
                title="Điều khoản dịch vụ"
                subtitle="Xem điều khoản sử dụng"
              />
              <SettingItem
                icon="shield-check-outline"
                title="Chính sách riêng tư"
                subtitle="Xem cách chúng tôi bảo vệ dữ liệu"
              />
            </View>
          </View>

          {/* Danger Zone */}
          <View style={{ paddingHorizontal: 16 }}>
            <SectionTitle title="Khu vực nguy hiểm" />

            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color="#E63946"
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#E63946",
                  }}
                >
                  Đăng xuất
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#E63946"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color="#E63946"
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#E63946",
                  }}
                >
                  Xóa tài khoản
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#E63946"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 32 }} />
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
    </SidebarLayout>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { authService } from "../../lib/services/authService";
import { employerService } from "../../lib/services/employerService";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";
import { useAlert } from "../Component/useAlert";

interface EmployerAccount {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  joinDate: string;
  verificationStatus: "verified" | "unverified";
  companyName?: string;
}

export default function ApplicantAccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<EmployerAccount | null>(null);
  const { alertState, showAlert, hideAlert } = useAlert();

  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    applicationUpdates: true,
    candidateMessages: true,
  });

  const [privacy, setPrivacy] = React.useState({
    profilePublic: false,
    showOnlineStatus: true,
  });

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push("/(auth)/login");
        return;
      }

      const employer = await employerService.getEmployerProfile(currentUser.id);
      const profile = currentUser.user_metadata || {};

      // Format join date
      const joinDate = new Date(currentUser.created_at || new Date());
      const formattedDate = joinDate.toLocaleDateString("vi-VN");

      setUser({
        fullName: profile.full_name || "Nhà tuyển dụng",
        email: currentUser.email || "",
        phone: profile.phone || "",
        avatarUrl: profile.avatar_url || "https://i.pravatar.cc/150?img=32",
        joinDate: formattedDate,
        verificationStatus: currentUser.email_confirmed_at
          ? "verified"
          : "unverified",
        companyName: employer?.company?.name || "Chưa cập nhật",
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      showAlert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showAlert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel", onPress: () => hideAlert() },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.signOut();
            router.push("/(auth)/login");
          } catch (error) {
            showAlert("Lỗi", "Có lỗi khi đăng xuất");
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

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  if (!user) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: colors.textDark }}>
              Không thể tải dữ liệu
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
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
                source={{ uri: user.avatarUrl }}
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
                {user.fullName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textGray,
                  marginBottom: 12,
                }}
              >
                {user.companyName}
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
              onPress={() => router.push("/Employer/EditProfile" as any)}
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
                    {user.phone || "Chưa cập nhật"}
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
                icon="file-document-outline"
                title="Cập nhật đơn ứng tuyển"
                value={notifications.applicationUpdates}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    applicationUpdates: !notifications.applicationUpdates,
                  })
                }
              />
              <NotificationToggle
                icon="chat-outline"
                title="Tin nhắn từ ứng viên"
                value={notifications.candidateMessages}
                onToggle={() =>
                  setNotifications({
                    ...notifications,
                    candidateMessages: !notifications.candidateMessages,
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
    </EmployerSidebarLayout>
  );
}

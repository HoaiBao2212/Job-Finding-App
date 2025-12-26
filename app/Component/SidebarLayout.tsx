import { authService } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";
import {
  Animated,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import AlertModal from "./AlertModal";
import { useAlert } from "./useAlert.hook";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarLayout");
  }
  return context;
};

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "home", label: "Việc làm", route: "/Candidate/JobFinding" },
  { icon: "file-document", label: "Đơn ứng tuyển", route: "/Candidate/Apply" },
  { icon: "calendar", label: "Lịch phỏng vấn", route: "/Candidate/Schedule" },
  {
    icon: "account",
    label: "Hồ sơ",
    route: "/Candidate/CandidateProfileScreen",
  },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState<string>("Người dùng");
  const sidebarAnimation = React.useRef(new Animated.Value(0)).current;
  const { alertState, showAlert, hideAlert } = useAlert();

  // Fetch user full name
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (data?.full_name) {
            setFullName(data.full_name);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleSidebar = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    showAlert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
        onPress: hideAlert,
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          hideAlert();
          try {
            await authService.signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
            showAlert("Lỗi", "Có lỗi khi đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const sidebarTranslate = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-280, 0],
  });

  const overlayOpacity = sidebarAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const handleMenuPress = (route: string) => {
    router.push(route as any);
    closeSidebar();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* Sidebar */}
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 280,
              backgroundColor: colors.white,
              borderRightWidth: 1,
              borderRightColor: colors.borderLight,
              zIndex: 1000,
              transform: [{ translateX: sidebarTranslate }],
              shadowColor: "#000",
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Sidebar Header */}
            <View
              style={{
                paddingVertical: 24,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primarySoftBg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="briefcase"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.textDark,
                }}
              >
                Xin chào {fullName}
              </Text>
            </View>

            {/* Menu Items */}
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => handleMenuPress(item.route)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    marginHorizontal: 8,
                    marginVertical: 4,
                    borderRadius: 8,
                    backgroundColor: isActive
                      ? colors.primarySoftBg
                      : "transparent",
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={isActive ? colors.primary : colors.textGray}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? "600" : "500",
                      color: isActive ? colors.primary : colors.textDark,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Sidebar Footer */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              }}
            >
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={colors.textGray}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.textGray,
                  }}
                >
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Overlay */}
          {isOpen && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeSidebar}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: "#000",
                  opacity: overlayOpacity,
                }}
              />
            </TouchableOpacity>
          )}

          {/* Main Content */}
          <View style={{ flex: 1, position: "relative" }}>{children}</View>
        </View>
      </SafeAreaView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </SidebarContext.Provider>
  );
}

import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";
import {
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import AlertModal from "./AlertModal";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within EmployerSidebarLayout");
  }
  return context;
};

interface EmployerSidebarLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "view-dashboard", label: "Dashboard", route: "/Employer/Dashboard" },
  {
    icon: "briefcase",
    label: "Tin tuyển dụng",
    route: "/Employer/JobApplication",
  },
  {
    icon: "account-multiple",
    label: "Người ứng tuyển",
    route: "/Employer/CandidateApply",
  },
  { icon: "account-circle", label: "Tài khoản", route: "/Employer/Account" },
];

export default function EmployerSidebarLayout({
  children,
}: EmployerSidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<
    Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>
  >([]);
  const sidebarAnimation = React.useRef(new Animated.Value(0)).current;

  const toggleSidebar = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(false);
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

  // Logout + chuyển về màn login
  const handleLogout = () => {
    setAlertTitle("Đăng xuất");
    setAlertMessage("Bạn có chắc chắn muốn đăng xuất?");
    setAlertButtons([
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => {
          setAlertVisible(false);
        },
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();

            if (error) {
              setAlertMessage(error.message);
              setAlertTitle("Lỗi");
              return;
            }

            // Reset stack về màn login
            router.replace("/(auth)/login");
          } catch (err: any) {
            setAlertMessage(
              err?.message || "Không thể đăng xuất. Hãy thử lại."
            );
            setAlertTitle("Lỗi");
          }
        },
      },
    ]);
    setAlertVisible(true);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      <View style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
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
                paddingVertical: 20,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
                marginBottom: 16,
                marginTop: 8,
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
                Nhà Tuyển Dụng
              </Text>
            </View>

            {/* Menu Items */}
            {MENU_ITEMS.map((item) => {
              const routeName = item.route.split("/").pop() || "";
              const isActive = pathname.includes(routeName);
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
                zIndex: 1001,
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
          <View style={{ flex: 1, position: "relative" }}>
            {/* Page Content */}
            {children}
          </View>
        </View>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onDismiss={() => setAlertVisible(false)}
      />
    </SidebarContext.Provider>
  );
}

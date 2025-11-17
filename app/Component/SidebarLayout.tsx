import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/theme';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'home', label: 'Việc làm', route: '/Candidate/JobFinding' },
  { icon: 'file-document', label: 'Đơn ứng tuyển', route: '/Candidate/Apply' },
  { icon: 'calendar', label: 'Lịch phỏng vấn', route: '/Candidate/Schedule' },
  { icon: 'account', label: 'Hồ sơ', route: '/Candidate/CandidateProfileScreen' },
  { icon: 'cog', label: 'Tài khoản', route: '/Candidate/Account' },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 280,
            backgroundColor: colors.white,
            borderRightWidth: 1,
            borderRightColor: colors.borderLight,
            zIndex: 1000,
            transform: [{ translateX: sidebarTranslate }],
            shadowColor: '#000',
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
                justifyContent: 'center',
                alignItems: 'center',
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
                fontWeight: '700',
                color: colors.textDark,
              }}
            >
              Việc Làm
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginHorizontal: 8,
                  marginVertical: 4,
                  borderRadius: 8,
                  backgroundColor: isActive ? colors.primarySoftBg : 'transparent',
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
                    fontWeight: isActive ? '600' : '500',
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
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
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
                  fontWeight: '500',
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
              position: 'absolute',
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
                backgroundColor: '#000',
                opacity: overlayOpacity,
              }}
            />
          </TouchableOpacity>
        )}

        {/* Main Content */}
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Toggle Button */}
          <TouchableOpacity
            onPress={toggleSidebar}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 100,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.shadowLight,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <MaterialCommunityIcons
              name={isOpen ? 'close' : 'menu'}
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* Page Content */}
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}


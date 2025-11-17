import { Fonts, theme } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current; // 0: đóng, 1: mở

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen, drawerAnim]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const drawerTranslateX = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  const drawerOverlayOpacity = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.25],
  });

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background.main }]}
    >
      <StatusBar barStyle="dark-content" />

      {/* HEADER: Thanh tìm kiếm cố định */}
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: theme.background.main,
            borderBottomColor: theme.colors.borderLight,
          },
        ]}
      >
        <View style={styles.searchRow}>
          {/* Ô tìm kiếm */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.background.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
          >
            <TextInput
              placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
              placeholderTextColor={theme.text.subtle}
              style={[
                styles.searchInput,
                { color: theme.text.body, fontFamily: Fonts.sans },
              ]}
            />
          </View>

          {/* Nút 3 gạch ngang */}
          <TouchableOpacity
            style={[
              styles.menuButton,
              { backgroundColor: theme.colors.primary },
            ]}
            activeOpacity={0.8}
            onPress={openDrawer}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        </View>
      </View>

      {/* NỘI DUNG CUỘN ĐƯỢC */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: theme.background.main },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner (không có chữ xin chào, không có ảnh profile) */}
        <View
          style={[styles.banner, { backgroundColor: theme.background.soft }]}
        >
          <Text
            style={[
              styles.bannerTitle,
              { color: theme.text.heading, fontFamily: Fonts.sans },
            ]}
          >
            Khám phá cơ hội việc làm
          </Text>
          <Text
            style={[
              styles.bannerSubtitle,
              { color: theme.text.body, fontFamily: Fonts.sans },
            ]}
          >
            Hàng ngàn công việc mới được cập nhật mỗi ngày, phù hợp với kỹ năng
            và kinh nghiệm của bạn.
          </Text>
        </View>

        {/* Bộ lọc nhanh: Toàn thời gian, Bán thời gian hiển thị cố định và đầy đủ */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text.heading, fontFamily: Fonts.sans },
          ]}
        >
          Loại công việc
        </Text>
        <View style={styles.quickFilterRow}>
          {["Toàn thời gian", "Bán thời gian", "Thực tập", "Remote"].map(
            (item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.background.card,
                    borderColor: theme.colors.borderLight,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: xử lý filter nhưng không cho popup quá to
                  console.log("Filter:", item);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: theme.colors.primary, fontFamily: Fonts.sans },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Gợi ý công việc */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text.heading, fontFamily: Fonts.sans },
          ]}
        >
          Gợi ý cho bạn
        </Text>
        <JobCard
          title="React Native Developer"
          company="Công ty ABC"
          meta="📍 Hồ Chí Minh • 15–25 triệu"
        />
        <JobCard
          title="UI/UX Designer"
          company="Công ty XYZ"
          meta="📍 Hà Nội • 10–18 triệu"
        />

        {/* Công việc mới nhất */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text.heading, fontFamily: Fonts.sans },
          ]}
        >
          Công việc mới nhất
        </Text>
        <JobCard
          title="Backend Node.js Developer"
          company="TechSoft Co."
          meta="📍 Đà Nẵng • 18–30 triệu"
        />
        <JobCard
          title="Nhân viên Kinh doanh"
          company="SalesPlus"
          meta="📍 Hồ Chí Minh • 8–15 triệu + thưởng"
          style={{ marginBottom: 32 }}
        />
      </ScrollView>

      {/* OVERLAY TỐI KHI MỞ DRAWER */}
      <Pressable
        style={[StyleSheet.absoluteFill, { zIndex: 15 }]} // ✅ thêm zIndex để nằm trên header + nội dung
        pointerEvents={isDrawerOpen ? "auto" : "none"}
        onPress={closeDrawer}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#000", opacity: drawerOverlayOpacity },
          ]}
        />
      </Pressable>

      {/* SIDE DRAWER */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: drawerTranslateX }],
            backgroundColor: theme.background.card,
          },
        ]}
      >
        {/* Profile trong drawer */}
        <View style={styles.drawerHeader}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=32" }}
            style={styles.drawerAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.drawerName,
                { color: theme.text.heading, fontFamily: Fonts.sans },
              ]}
            >
              Nguyễn Văn A
            </Text>
            <Text
              style={[
                styles.drawerRole,
                { color: theme.text.subtle, fontFamily: Fonts.sans },
              ]}
            >
              Ứng viên tìm việc
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.drawerDivider,
            { backgroundColor: theme.colors.borderLight },
          ]}
        />

        {/* Các nút menu */}
        <DrawerItem
          label="Profile"
          icon="🧑"
          onPress={() => {
            console.log("Đi tới màn Profile");
            closeDrawer();
          }}
        />

        <DrawerItem
          label="Home"
          icon="🏠"
          active
          onPress={() => {
            // đang ở Home
            closeDrawer();
          }}
        />
        <DrawerItem
          label="Tìm việc"
          icon="🔍"
          onPress={() => {
            console.log("Đi tới màn Tìm việc");
            closeDrawer();
          }}
        />
        <DrawerItem
          label="Lịch"
          icon="📅"
          onPress={() => {
            console.log("Đi tới màn Lịch");
            closeDrawer();
          }}
        />
        <DrawerItem
          label="Ứng tuyển"
          icon="📨"
          onPress={() => {
            console.log("Đi tới màn Ứng tuyển");
            closeDrawer();
          }}
        />
        <DrawerItem
          label="Tài khoản"
          icon="👤"
          onPress={() => {
            console.log("Đi tới màn Tài khoản");
            closeDrawer();
          }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

/** ============ Job Card ============ */

type JobCardProps = {
  title: string;
  company: string;
  meta: string;
  style?: object;
};

const JobCard: React.FC<JobCardProps> = ({ title, company, meta, style }) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background.card,
          borderColor: theme.colors.borderLight,
          shadowColor: theme.colors.shadowLight,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.jobTitle,
          { color: theme.text.heading, fontFamily: Fonts.sans },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.jobCompany,
          { color: theme.text.body, fontFamily: Fonts.sans },
        ]}
      >
        {company}
      </Text>
      <Text
        style={[
          styles.jobMeta,
          { color: theme.text.subtle, fontFamily: Fonts.sans },
        ]}
      >
        {meta}
      </Text>
    </View>
  );
};

/** ============ Drawer Item ============ */

type DrawerItemProps = {
  label: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
};

const DrawerItem: React.FC<DrawerItemProps> = ({
  label,
  icon,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.drawerItem,
        active && { backgroundColor: theme.background.soft },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.drawerItemIcon]}>{icon}</Text>
      <Text
        style={[
          styles.drawerItemLabel,
          {
            color: active ? theme.colors.primary : theme.text.body,
            fontFamily: Fonts.sans,
            fontWeight: active ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/** ============ Styles ============ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 14,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLine: {
    width: 20,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginVertical: 1.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  quickFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 13,
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 12,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 260,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
    zIndex: 20,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
  },
  drawerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  drawerRole: {
    fontSize: 13,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginBottom: 4,
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  drawerItemLabel: {
    fontSize: 15,
  },
});

import React from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, Fonts } from "../../constants/theme";

interface HeroBannerProps {
  supportingText?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  supportingText = "Khám phá những cơ hội phù hợp với kỹ năng và nguyện vọng của bạn",
}) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleAccessibilityFocus = async () => {
    if (Platform.OS === "web") {
      await AccessibilityInfo.announceForAccessibility(
        "Hero banner section. Slogan: Fresher today, Dev tomorrow. " +
          supportingText
      );
    }
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="header"
      onAccessibilityTap={handleAccessibilityFocus}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background gradient overlay effect */}
        <View style={styles.backgroundGradient} />

        {/* Content wrapper */}
        <View style={[styles.content, isLargeScreen && styles.contentLarge]}>
          {/* Main slogan */}
          <Text
            style={[
              styles.slogan,
              styles.sloganLineLeft,
              isLargeScreen && styles.sloganLarge,
            ]}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel="Fresher today, Dev tomorrow"
          >
            Fresher today,
          </Text>
          <Text
            style={[
              styles.slogan,
              styles.sloganHighlight,
              styles.sloganLineRight,
              isLargeScreen && styles.sloganLarge,
            ]}
            accessible={true}
            accessibilityLabel="Dev tomorrow"
          >
            Dev tomorrow
          </Text>

          {/* Supporting text */}
          <Text
            style={[
              styles.supportingText,
              isLargeScreen && styles.supportingTextLarge,
            ]}
            accessible={true}
            accessibilityLabel={supportingText}
          >
            {supportingText}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.primarySoftBg,
    minHeight: 280,
    paddingVertical: 40,
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primarySoftBg,
    zIndex: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    maxWidth: "100%",
    zIndex: 1,
  },
  contentLarge: {
    maxWidth: 900,
    alignSelf: "center",
  },
  slogan: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginVertical: 8,
    letterSpacing: -0.5,
    lineHeight: 44,
    fontFamily: Fonts.sans,
  },
  sloganLarge: {
    fontSize: 56,
    lineHeight: 68,
    marginVertical: 12,
  },
  sloganLineLeft: {
    marginRight: 10,
  },
  sloganLineRight: {
    marginLeft: 10,
  },
  sloganHighlight: {
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  supportingText: {
    fontSize: 16,
    color: colors.textGray,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 500,
    fontWeight: "400",
    fontFamily: Fonts.sans,
  },
  supportingTextLarge: {
    fontSize: 18,
    marginBottom: 48,
    maxWidth: 600,
    lineHeight: 28,
  },
});

export default HeroBanner;

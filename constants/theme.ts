import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const colors = {
  // ==============================
  //  PRIMARY PALETTE (Xanh biển)
  // ==============================
  primary: "#1C7ED6", // Màu chính
  primaryDark: "#1864AB", // Màu đậm
  primaryLight: "#A5D8FF", // Màu nhạt
  primarySoftBg: "#E7F5FF", // Background xanh nhẹ

  // ==============================
  //  NEUTRAL / TEXT / GRAY
  // ==============================
  textDark: "#333333",
  textBlue: "#0B5394",
  textGray: "#777777",

  bgNeutral: "#F8F9FA",
  white: "#FFFFFF",

  // ==============================
  //  BORDER & SHADOW
  // ==============================
  borderLight: "#A5D8FF",
  shadowLight: "rgba(0, 0, 0, 0.05)",
};

// Optional: Theme groups for easier usage
export const theme = {
  colors,
  button: {
    primary: {
      bg: colors.primary,
      text: colors.white,
    },
    secondary: {
      bg: colors.white,
      text: colors.primary,
      border: colors.primary,
    },
  },
  text: {
    heading: colors.textBlue,
    body: colors.textDark,
    subtle: colors.textGray,
  },
  background: {
    main: colors.bgNeutral,
    card: colors.white,
    soft: colors.primarySoftBg,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

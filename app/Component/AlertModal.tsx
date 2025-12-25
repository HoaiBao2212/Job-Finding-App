import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
}

export default function AlertModal({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}: AlertModalProps) {
  const handleBackdropPress = () => {
    // Bấm ngoài sẽ tự động tắt alert
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case "destructive":
        return {
          color: "#FF3B30",
          fontWeight: "600" as const,
        };
      case "cancel":
        return {
          color: colors.textGray,
          fontWeight: "500" as const,
        };
      default:
        return {
          color: colors.primary,
          fontWeight: "600" as const,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackdropPress}
        style={styles.backdrop}
      >
        {/* Alert Box */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.centerContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.alertBox}>
            {/* Title */}
            {title && <Text style={styles.title}>{title}</Text>}

            {/* Message */}
            {message && <Text style={styles.message}>{message}</Text>}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    index < buttons.length - 1 && styles.buttonBorder,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                  }}
                >
                  <Text
                    style={[styles.buttonText, getButtonStyle(button.style)]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minWidth: 280,
    maxWidth: Platform.OS === "web" ? 400 : "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textGray,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  button: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
});

import { Text, View } from "react-native";
import { colors } from "../../constants/theme";

export default function ApplicantTaskBar() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgNeutral,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 16, color: colors.textDark }}>
        ApplicantTaskBar
      </Text>
    </View>
  );
}

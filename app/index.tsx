import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home Screen</Text>

      <TouchableOpacity
        onPress={() => router.push("/Candidate/JobSearchScreen")}
        style={{
          marginTop: 20,
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: "#1C7ED6",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Đi đến Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

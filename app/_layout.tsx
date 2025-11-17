import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="Candidate/CandidateProfileScreen"
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Candidate/JobFinding"
        options={{ title: "Tìm việc" }}
      />
      <Stack.Screen
        name="Candidate/JobDetail"
        options={{ title: "Chi tiết công việc" }}
      />
      <Stack.Screen
        name="Candidate/Apply"
        options={{ title: "Đơn ứng tuyển" }}
      />
      <Stack.Screen
        name="Candidate/Schedule"
        options={{ title: "Lịch phỏng vấn" }}
      />
      <Stack.Screen
        name="Candidate/Account"
        options={{ title: "Tài khoản" }}
      />
    </Stack>
  );
}

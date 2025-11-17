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
        name="Candidate/Home"
        options={{ title: "Home Ứng viên" }}
      />
      <Stack.Screen
        name="Candidate/JobDetail"
        options={{ title: "Chi tiết công việc" }}
      />
    </Stack>
  );
}

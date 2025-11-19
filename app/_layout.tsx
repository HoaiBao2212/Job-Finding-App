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
      <Stack.Screen
        name="Candidate/EditProfile"
        options={{ title: "Chỉnh sửa hồ sơ" }}
      />
      <Stack.Screen
        name="Employer/Dashboard"
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="Employer/JobApplication"
        options={{ title: "Tin tuyển dụng" }}
      />
      <Stack.Screen
        name="Employer/CandidateApply"
        options={{ title: "Người ứng tuyển" }}
      />
      <Stack.Screen
        name="Employer/JobPosting"
        options={{ title: "Đăng tin tuyển dụng" }}
      />
      <Stack.Screen
        name="Employer/Account"
        options={{ title: "Tài khoản" }}
      />
      <Stack.Screen
        name="Employer/JobDetail"
        options={{ title: "Chi tiết công việc" }}
      /><Stack.Screen
        name="Employer/Companies"
        options={{ title: "Chi tiết công ty" }}
      />
    </Stack>
  );
}

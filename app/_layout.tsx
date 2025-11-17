import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="Candidate/CandidateProfileScreen"
        options={{ title: "Profile" }}
      />
    </Stack>
  );
}

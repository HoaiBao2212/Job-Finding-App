import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";

interface SelectedApplication {
  id: number;
  job_id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_avatar: string;
  candidate_email: string;
  job_title: string;
}

interface InterviewDetails {
  type: "online" | "offline";
  start_time: string;
  start_date: string;
  end_time: string;
  timezone: string;
  location?: string;
  meeting_link?: string;
  note?: string;
}

export default function ScheduleInterviewDetailScreen() {
  return (
    <EmployerSidebarLayout>
      <ScheduleInterviewContent />
    </EmployerSidebarLayout>
  );
}

function ScheduleInterviewContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<
    SelectedApplication[]
  >([]);
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails>({
    type: "online",
    start_time: "10:00",
    start_date: new Date().toISOString().split("T")[0],
    end_time: "11:00",
    timezone: "Asia/Ho_Chi_Minh",
  });
  const [saving, setSaving] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Load selected applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        if (!params.applicationIds) {
          showAlert("Error", "No applications selected");
          return;
        }

        const applicationIds = JSON.parse(params.applicationIds as string);

        // Get applications details
        const { data, error } = await supabase
          .from("job_applications")
          .select(
            `
            id,
            job_id,
            candidate_id,
            jobs(title),
            candidate_profiles(
              user:profiles(
                full_name,
                avatar_url,
                email
              )
            )
          `
          )
          .in("id", applicationIds);

        if (error) throw error;

        const formatted: SelectedApplication[] = (data || []).map(
          (app: any) => ({
            id: app.id,
            job_id: app.job_id,
            candidate_id: app.candidate_id,
            candidate_name:
              app.candidate_profiles?.user?.full_name || "Unknown",
            candidate_avatar: app.candidate_profiles?.user?.avatar_url || "",
            candidate_email: app.candidate_profiles?.user?.email || "",
            job_title: app.jobs?.title || "Unknown Job",
          })
        );

        setSelectedApplications(formatted);
      } catch (error) {
        console.error("Error loading applications:", error);
        showAlert("Error", "Failed to load selected applications");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [params.applicationIds]);

  const handleSchedule = async () => {
    try {
      if (!interviewDetails.start_date || !interviewDetails.start_time) {
        showAlert("Validation Error", "Please fill in all required fields");
        return;
      }

      if (interviewDetails.type === "offline" && !interviewDetails.location) {
        showAlert("Validation Error", "Please enter the interview location");
        return;
      }

      if (
        interviewDetails.type === "online" &&
        !interviewDetails.meeting_link
      ) {
        showAlert("Validation Error", "Please enter the meeting link");
        return;
      }

      setSaving(true);

      // Get employer info
      const { data: userProfile } = await supabase.auth.getUser();
      if (!userProfile.user) {
        showAlert("Error", "User not found");
        return;
      }

      const { data: employer } = await supabase
        .from("employers")
        .select("id, company_id")
        .eq("user_id", userProfile.user.id)
        .single();

      if (!employer) {
        showAlert("Error", "Employer profile not found");
        return;
      }

      // Combine date and time
      const startDateTime = `${interviewDetails.start_date}T${interviewDetails.start_time}:00`;
      const endDateTime = `${interviewDetails.start_date}T${interviewDetails.end_time}:00`;

      // Create interview record for each selected application
      const interviews = selectedApplications.map((app) => ({
        job_id: app.job_id,
        company_id: employer.company_id,
        created_by_employer_id: employer.id,
        start_time: startDateTime,
        end_time: endDateTime,
        timezone: interviewDetails.timezone,
        type: interviewDetails.type,
        location:
          interviewDetails.type === "offline"
            ? interviewDetails.location
            : null,
        meeting_link:
          interviewDetails.type === "online"
            ? interviewDetails.meeting_link
            : null,
        note: interviewDetails.note || null,
        status: "scheduled",
      }));

      const { data: createdInterviews, error: interviewError } = await supabase
        .from("interviews")
        .insert(interviews)
        .select("id");

      if (interviewError) throw interviewError;

      // Create interview_participants records for each application
      const interviewParticipants = selectedApplications.map((app, index) => ({
        interview_id: createdInterviews?.[index]?.id,
        application_id: app.id,
        candidate_id: app.candidate_id,
        participant_status: "invited",
      }));

      const { error: participantsError } = await supabase
        .from("interview_participants")
        .insert(interviewParticipants);

      if (participantsError) throw participantsError;

      // Link interviews to applications
      const applicationUpdates = selectedApplications.map((app, index) => ({
        id: app.id,
        interview_id: createdInterviews?.[index]?.id || null,
      }));

      for (const update of applicationUpdates) {
        const { error: updateError } = await supabase
          .from("job_applications")
          .update({ interview_id: update.interview_id })
          .eq("id", update.id);

        if (updateError) throw updateError;
      }

      // Get candidate user IDs for notifications
      const { data: candidateProfiles, error: candidateError } = await supabase
        .from("candidate_profiles")
        .select("id, user_id, user:profiles(full_name)")
        .in(
          "id",
          selectedApplications.map((app) => app.candidate_id)
        );

      if (candidateError) throw candidateError;

      // Format interview details for notification body
      const interviewDate = new Date(
        `${interviewDetails.start_date}T${interviewDetails.start_time}`
      ).toLocaleString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Create notifications for each candidate
      if (candidateProfiles && candidateProfiles.length > 0) {
        const notifications = selectedApplications
          .map((app) => {
            const candidateProfile = candidateProfiles.find(
              (cp: any) => cp.id === app.candidate_id
            );
            if (!candidateProfile?.user_id) return null;

            const notificationBody =
              `Bạn được mời tham gia phỏng vấn cho vị trí ${app.job_title}\n` +
              `Thời gian: ${interviewDate}\n` +
              `Hình thức: ${
                interviewDetails.type === "online"
                  ? "Trực tuyến"
                  : "Tại văn phòng"
              }`;

            return {
              user_id: candidateProfile.user_id,
              title: "Lời mời phỏng vấn",
              body: notificationBody,
              type: "interview_scheduled",
              data: {
                interviewId:
                  createdInterviews?.[selectedApplications.indexOf(app)]?.id,
                jobId: app.job_id,
                applicationId: app.id,
                start_time: `${interviewDetails.start_date}T${interviewDetails.start_time}:00`,
                type: interviewDetails.type,
                meeting_link:
                  interviewDetails.type === "online"
                    ? interviewDetails.meeting_link
                    : null,
                location:
                  interviewDetails.type === "offline"
                    ? interviewDetails.location
                    : null,
              },
            };
          })
          .filter((n) => n !== null);

        if (notifications.length > 0) {
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert(notifications);

          if (notificationError) {
            console.error("Error creating notifications:", notificationError);
            // Don't fail the whole operation if notifications fail
          }
        }
      }

      showAlert("Success", "Interviews scheduled successfully!");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      showAlert("Error", "Failed to schedule interviews");
    } finally {
      setSaving(false);
    }
  };

  const CandidateCard = ({ item }: { item: SelectedApplication }) => (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: item.candidate_avatar || "https://via.placeholder.com/40",
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          marginRight: 12,
          backgroundColor: colors.borderLight,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: colors.textDark,
            marginBottom: 2,
          }}
        >
          {item.candidate_name}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.textGray,
          }}
        >
          {item.job_title}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="check-circle"
        size={20}
        color={colors.primary}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.bgNeutral,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bgNeutral,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={colors.textDark}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.textDark,
              flex: 1,
            }}
          >
            Schedule Interview
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        {/* Selected Candidates Section */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textDark,
              marginBottom: 10,
            }}
          >
            Selected Candidates ({selectedApplications.length})
          </Text>
          {selectedApplications.map((app) => (
            <CandidateCard key={app.id} item={app} />
          ))}
        </View>

        {/* Interview Type */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textDark,
              marginBottom: 10,
            }}
          >
            Interview Type
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            {(["online", "offline"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  setInterviewDetails({ ...interviewDetails, type })
                }
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    interviewDetails.type === type
                      ? colors.primary
                      : colors.borderLight,
                  backgroundColor:
                    interviewDetails.type === type
                      ? colors.primarySoftBg
                      : colors.bgNeutral,
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name={
                    type === "online" ? "video-outline" : "map-marker-outline"
                  }
                  size={18}
                  color={
                    interviewDetails.type === type
                      ? colors.primary
                      : colors.textGray
                  }
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      interviewDetails.type === type
                        ? colors.primary
                        : colors.textGray,
                    textTransform: "capitalize",
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textDark,
              marginBottom: 8,
            }}
          >
            Interview Date *
          </Text>
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              paddingHorizontal: 12,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="calendar-outline"
              size={18}
              color={colors.primary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={interviewDetails.start_date}
              onChangeText={(text) =>
                setInterviewDetails({ ...interviewDetails, start_date: text })
              }
              placeholder="YYYY-MM-DD"
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.textDark,
              }}
            />
          </View>
        </View>

        {/* Time */}
        <View
          style={{
            marginBottom: 20,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              Start Time *
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.borderLight,
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={interviewDetails.start_time}
                onChangeText={(text) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    start_time: text,
                  })
                }
                placeholder="HH:MM"
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.textDark,
                }}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              End Time *
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.borderLight,
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={interviewDetails.end_time}
                onChangeText={(text) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    end_time: text,
                  })
                }
                placeholder="HH:MM"
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.textDark,
                }}
              />
            </View>
          </View>
        </View>

        {/* Location/Meeting Link */}
        {interviewDetails.type === "online" ? (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              Meeting Link *
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.borderLight,
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <MaterialCommunityIcons
                name="link"
                size={18}
                color={colors.primary}
                style={{ marginRight: 10, marginTop: 8 }}
              />
              <TextInput
                value={interviewDetails.meeting_link || ""}
                onChangeText={(text) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    meeting_link: text,
                  })
                }
                placeholder="https://meet.google.com/..."
                multiline
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.textDark,
                  minHeight: 40,
                }}
              />
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textDark,
                marginBottom: 8,
              }}
            >
              Location *
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.borderLight,
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 10, marginTop: 8 }}
              />
              <TextInput
                value={interviewDetails.location || ""}
                onChangeText={(text) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    location: text,
                  })
                }
                placeholder="Building, Address, Room Number..."
                multiline
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.textDark,
                  minHeight: 40,
                }}
              />
            </View>
          </View>
        )}

        {/* Note */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textDark,
              marginBottom: 8,
            }}
          >
            Additional Notes (Optional)
          </Text>
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderLight,
              paddingHorizontal: 12,
              paddingVertical: 12,
              minHeight: 80,
            }}
          >
            <TextInput
              value={interviewDetails.note || ""}
              onChangeText={(text) =>
                setInterviewDetails({
                  ...interviewDetails,
                  note: text,
                })
              }
              placeholder="Preparation instructions, interview topics, etc."
              multiline
              textAlignVertical="top"
              style={{
                fontSize: 14,
                color: colors.textDark,
                minHeight: 60,
              }}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={saving}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.borderLight,
            backgroundColor: colors.white,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: colors.textGray,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSchedule}
          disabled={saving}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
            backgroundColor: saving ? colors.textGray : colors.primary,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.white,
              }}
            >
              Schedule for All
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={[
          {
            text: "OK",
            onPress: () => setAlertVisible(false),
          },
        ]}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

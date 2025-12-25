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
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import AlertModal from "../Component/AlertModal";
import EmployerSidebarLayout, {
  useSidebar,
} from "../Component/EmployerSidebarLayout";

interface CandidateProfile {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  headline: string | null;
  desired_position: string | null;
  years_of_experience: number | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  preferred_locations: string | null;
}

interface Skill {
  id: number;
  name: string;
}

interface Experience {
  id: number;
  position: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
}

interface Education {
  id: number;
  school_name: string;
  degree: string;
  major: string;
  end_date: string | null;
}

interface InterviewInfo {
  id: number;
  start_time: string;
  timezone: string;
  type: "online" | "offline";
  meeting_link: string | null;
  location: string | null;
  note: string | null;
  status: string;
}

interface InterviewParticipant {
  id: number;
  interview_id: number;
  application_id: number;
  candidate_id: number;
  participant_status: string;
}

export default function InterviewCandidateDetailScreen() {
  return (
    <EmployerSidebarLayout>
      <InterviewCandidateDetailContent />
    </EmployerSidebarLayout>
  );
}

function InterviewCandidateDetailContent() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [interview, setInterview] = useState<InterviewInfo | null>(null);
  const [participant, setParticipant] = useState<InterviewParticipant | null>(
    null
  );
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const [expandedEdu, setExpandedEdu] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const interviewId = parseInt(params.interviewId as string);
        const candidateId = parseInt(params.candidateId as string);

        if (!interviewId || !candidateId) {
          showAlert("Error", "Invalid parameters");
          return;
        }

        // Fetch interview info
        const { data: interviewData, error: interviewError } = await supabase
          .from("interviews")
          .select(
            "id, start_time, timezone, type, meeting_link, location, note, status"
          )
          .eq("id", interviewId)
          .single();

        if (interviewError) {
          console.error("Interview fetch error:", interviewError);
          throw interviewError;
        }
        setInterview(interviewData);

        // Fetch interview participant record
        const { data: participantData, error: participantError } =
          await supabase
            .from("interview_participants")
            .select(
              "id, interview_id, application_id, candidate_id, participant_status"
            )
            .eq("interview_id", interviewId)
            .eq("candidate_id", candidateId)
            .single();

        if (participantError) {
          console.error("Participant fetch error:", participantError);
          throw participantError;
        }
        setParticipant(participantData);

        // Fetch candidate profile with user info
        const { data: candidateData, error: candidateError } = await supabase
          .from("candidate_profiles")
          .select(
            `
            id,
            user_id,
            headline,
            desired_position,
            years_of_experience,
            desired_salary_min,
            desired_salary_max,
            preferred_locations,
            user:profiles!candidate_profiles_user_id_fkey(
              full_name,
              email,
              phone,
              avatar_url
            )
          `
          )
          .eq("id", candidateId)
          .single();

        if (candidateError) {
          console.error("Candidate profile fetch error:", candidateError);
          throw candidateError;
        }

        const formattedCandidate: CandidateProfile = {
          id: candidateData.id,
          user_id: candidateData.user_id,
          full_name: (candidateData.user as any)?.full_name || "Unknown",
          email: (candidateData.user as any)?.email || "N/A",
          phone: (candidateData.user as any)?.phone || "N/A",
          avatar_url: (candidateData.user as any)?.avatar_url,
          headline: candidateData.headline,
          desired_position: candidateData.desired_position,
          years_of_experience: candidateData.years_of_experience,
          desired_salary_min: candidateData.desired_salary_min,
          desired_salary_max: candidateData.desired_salary_max,
          preferred_locations: candidateData.preferred_locations,
        };

        setCandidate(formattedCandidate);

        // Fetch skills (top 5)
        const { data: skillsData, error: skillsError } = await supabase
          .from("candidate_skills")
          .select("id, skill_id, skills(id, name)")
          .eq("candidate_id", candidateId)
          .limit(5);

        if (skillsError) {
          console.error("Skills fetch error:", skillsError);
          // Don't throw - skills are optional
          setSkills([]);
        } else {
          const formattedSkills = (skillsData || [])
            .map((item: any) => item.skills as any)
            .filter(Boolean);
          setSkills(formattedSkills);
        }

        // Fetch experiences
        const { data: experiencesData, error: experiencesError } =
          await supabase
            .from("candidate_experiences")
            .select(
              "id, position, company_name, start_date, end_date, description"
            )
            .eq("candidate_id", candidateId)
            .order("start_date", { ascending: false });

        if (experiencesError) {
          console.error("Experiences fetch error:", experiencesError);
          setExperiences([]);
        } else {
          setExperiences(experiencesData || []);
        }

        // Fetch educations
        const { data: educationsData, error: educationsError } = await supabase
          .from("candidate_educations")
          .select("id, school_name, degree, major, end_date")
          .eq("candidate_id", candidateId)
          .order("end_date", { ascending: false });

        if (educationsError) {
          console.error("Educations fetch error:", educationsError);
          setEducations([]);
        } else {
          setEducations(educationsData || []);
        }
      } catch (error) {
        console.error("Error loading candidate details:", error);
        showAlert("Error", "Failed to load candidate details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.interviewId, params.candidateId]);

  const formatDateTime = (dateString: string, timezone: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      });
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max) {
      return `${(min / 1000000).toFixed(0)}M - ${(max / 1000000).toFixed(
        0
      )}M VND`;
    }
    if (min) return `From ${(min / 1000000).toFixed(0)}M VND`;
    return `Up to ${(max! / 1000000).toFixed(0)}M VND`;
  };

  const getParticipantStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      invited: "Đã gửi lời mời",
      confirmed: "Đã chấp nhận",
      declined: "Đã từ chối",
      pending: "Chờ phản hồi",
    };
    return labels[status] || status;
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case "invited":
      case "pending":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "confirmed":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "declined":
        return { bg: "#FFEBEE", text: "#D32F2F" };
      default:
        return { bg: colors.bgNeutral, text: colors.textGray };
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (!participant) {
        showAlert("Error", "Participant data not found");
        return;
      }

      setUpdating(true);

      const { error } = await supabase
        .from("interview_participants")
        .update({ participant_status: newStatus })
        .eq("id", participant.id);

      if (error) throw error;

      // Update local state
      setParticipant({
        ...participant,
        participant_status: newStatus,
      });
      setStatusChanged(true);

      // Show success message
      const messages: Record<string, string> = {
        confirmed: "Đã chấp nhận ứng viên",
        declined: "Đã từ chối ứng viên",
        invited: "Đã chuyển về trạng thái chờ",
      };

      showAlert("Success", messages[newStatus] || "Status updated");
    } catch (error) {
      console.error("Error updating participant status:", error);
      showAlert("Error", "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const canUpdateStatus =
    interview && interview.status !== "canceled" && interview.status !== "done";

  const handleGoBack = () => {
    // Navigate back to interview detail page with interview ID
    if (params.interviewId) {
      router.push({
        pathname: "/Employer/InterviewScheduleDetail",
        params: { id: params.interviewId },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!candidate || !interview || !participant) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: colors.textGray }}>Data not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={handleGoBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={colors.white}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text
            style={{
              color: colors.white,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Chi tiết ứng viên
          </Text>
        </View>
        <TouchableOpacity onPress={toggleSidebar}>
          <MaterialCommunityIcons name="menu" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* SECTION A: Candidate Info */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.white,
            marginBottom: 8,
          }}
        >
          {/* Avatar and Basic Info */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 16,
              alignItems: "flex-start",
            }}
          >
            {candidate.avatar_url && (
              <Image
                source={{ uri: candidate.avatar_url }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  marginRight: 12,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {candidate.full_name}
              </Text>
              {candidate.headline && (
                <Text
                  style={{
                    color: colors.textGray,
                    fontSize: 13,
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  {candidate.headline}
                </Text>
              )}
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 4,
                  backgroundColor: getParticipantStatusColor(
                    participant.participant_status
                  ).bg,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: getParticipantStatusColor(
                      participant.participant_status
                    ).text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {getParticipantStatusLabel(participant.participant_status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View
            style={{
              backgroundColor: colors.bgNeutral,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.textGray, fontSize: 12 }}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Email
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {candidate.email}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textGray, fontSize: 12 }}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Phone
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {candidate.phone}
              </Text>
            </View>
          </View>

          {/* Professional Info */}
          {(candidate.years_of_experience ||
            candidate.desired_position ||
            candidate.desired_salary_min ||
            candidate.preferred_locations) && (
            <View
              style={{
                backgroundColor: colors.bgNeutral,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              {candidate.years_of_experience && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.textGray, fontSize: 12 }}>
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    Experience
                  </Text>
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {candidate.years_of_experience} years
                  </Text>
                </View>
              )}
              {candidate.desired_position && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.textGray, fontSize: 12 }}>
                    <MaterialCommunityIcons
                      name="target"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    Desired Position
                  </Text>
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {candidate.desired_position}
                  </Text>
                </View>
              )}
              {(candidate.desired_salary_min ||
                candidate.desired_salary_max) && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.textGray, fontSize: 12 }}>
                    <MaterialCommunityIcons
                      name="currency-usd"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    Salary Range
                  </Text>
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {formatSalary(
                      candidate.desired_salary_min,
                      candidate.desired_salary_max
                    )}
                  </Text>
                </View>
              )}
              {candidate.preferred_locations && (
                <View>
                  <Text style={{ color: colors.textGray, fontSize: 12 }}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={12}
                      color={colors.textGray}
                    />{" "}
                    Preferred Locations
                  </Text>
                  <Text
                    style={{
                      color: colors.textDark,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {candidate.preferred_locations}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View
              style={{
                backgroundColor: colors.bgNeutral,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.textGray,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Top Skills
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {skills.map((skill) => (
                  <View
                    key={skill.id}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: colors.primarySoftBg,
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {skill.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={14}
                  color={colors.textDark}
                />{" "}
                Work Experience
              </Text>
              {experiences.map((exp) => (
                <TouchableOpacity
                  key={exp.id}
                  onPress={() =>
                    setExpandedExp(expandedExp === exp.id ? null : exp.id)
                  }
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.textDark,
                          fontSize: 13,
                          fontWeight: "600",
                          marginBottom: 2,
                        }}
                      >
                        {exp.position}
                      </Text>
                      <Text
                        style={{
                          color: colors.textGray,
                          fontSize: 12,
                        }}
                      >
                        {exp.company_name} · {formatDate(exp.start_date)} -{" "}
                        {formatDate(exp.end_date)}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={
                        expandedExp === exp.id ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color={colors.textGray}
                    />
                  </View>
                  {expandedExp === exp.id && exp.description && (
                    <Text
                      style={{
                        color: colors.textGray,
                        fontSize: 12,
                        marginTop: 8,
                        lineHeight: 18,
                      }}
                    >
                      {exp.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Educations */}
          {educations.length > 0 && (
            <View>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                <MaterialCommunityIcons
                  name="school-outline"
                  size={14}
                  color={colors.textDark}
                />{" "}
                Education
              </Text>
              {educations.map((edu) => (
                <TouchableOpacity
                  key={edu.id}
                  onPress={() =>
                    setExpandedEdu(expandedEdu === edu.id ? null : edu.id)
                  }
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.textDark,
                          fontSize: 13,
                          fontWeight: "600",
                          marginBottom: 2,
                        }}
                      >
                        {edu.degree} in {edu.major}
                      </Text>
                      <Text
                        style={{
                          color: colors.textGray,
                          fontSize: 12,
                        }}
                      >
                        {edu.school_name}{" "}
                        {edu.end_date &&
                          `· Graduated ${formatDate(edu.end_date)}`}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={
                        expandedEdu === edu.id ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color={colors.textGray}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* SECTION B: Interview Info */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.white,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.textDark,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Interview Information
          </Text>

          <View
            style={{
              backgroundColor: colors.bgNeutral,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: colors.textGray, fontSize: 12 }}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={12}
                  color={colors.textGray}
                />{" "}
                Schedule
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 13,
                  marginTop: 4,
                  fontWeight: "500",
                }}
              >
                {formatDateTime(interview.start_time, interview.timezone)}
              </Text>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: colors.textGray, fontSize: 12 }}>
                <MaterialCommunityIcons
                  name={
                    interview.type === "online" ? "video-outline" : "map-marker"
                  }
                  size={12}
                  color={colors.textGray}
                />{" "}
                Type
              </Text>
              <Text
                style={{
                  color: colors.textDark,
                  fontSize: 13,
                  marginTop: 4,
                  fontWeight: "500",
                }}
              >
                {interview.type === "online" ? "Online" : "In-person"}
              </Text>
            </View>

            {interview.type === "online" && interview.meeting_link && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.textGray, fontSize: 12 }}>
                  <MaterialCommunityIcons
                    name="link-variant"
                    size={12}
                    color={colors.textGray}
                  />{" "}
                  Meeting Link
                </Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    marginTop: 4,
                    textDecorationLine: "underline",
                  }}
                  numberOfLines={1}
                >
                  {interview.meeting_link}
                </Text>
              </View>
            )}

            {interview.type === "offline" && interview.location && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: colors.textGray, fontSize: 12 }}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={12}
                    color={colors.textGray}
                  />{" "}
                  Location
                </Text>
                <Text
                  style={{
                    color: colors.textDark,
                    fontSize: 13,
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {interview.location}
                </Text>
              </View>
            )}

            {interview.note && (
              <View>
                <Text style={{ color: colors.textGray, fontSize: 12 }}>
                  <MaterialCommunityIcons
                    name="note-outline"
                    size={12}
                    color={colors.textGray}
                  />{" "}
                  Note
                </Text>
                <Text
                  style={{
                    color: colors.textDark,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {interview.note}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* SECTION C: Management Actions */}
        {statusChanged && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#E8F5E9",
              marginHorizontal: 16,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#388E3C",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={13}
                color="#388E3C"
              />{" "}
              Trạng thái đã được cập nhật
            </Text>
          </View>
        )}
        {!canUpdateStatus && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#FFEBEE",
              marginHorizontal: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#D32F2F",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={13}
                color="#D32F2F"
              />{" "}
              This interview is {interview.status}. Cannot update candidate
              status.
            </Text>
          </View>
        )}

        {canUpdateStatus && (
          <View style={{ padding: 16, backgroundColor: colors.white }}>
            <Text
              style={{
                color: colors.textDark,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Update Candidate Status
            </Text>

            <TouchableOpacity
              disabled={updating}
              onPress={() => handleStatusUpdate("confirmed")}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: "#E8F5E9",
                borderWidth: 1,
                borderColor: "#C8E6C9",
                marginBottom: 8,
                opacity: updating ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={18}
                  color="#388E3C"
                />
                <Text
                  style={{
                    color: "#388E3C",
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  Chấp nhận
                </Text>
                {updating && <ActivityIndicator size="small" color="#388E3C" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={updating}
              onPress={() => handleStatusUpdate("declined")}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: "#FFEBEE",
                borderWidth: 1,
                borderColor: "#FFCDD2",
                marginBottom: 8,
                opacity: updating ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={18}
                  color="#D32F2F"
                />
                <Text
                  style={{
                    color: "#D32F2F",
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  Từ chối
                </Text>
                {updating && <ActivityIndicator size="small" color="#D32F2F" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={updating}
              onPress={() => handleStatusUpdate("invited")}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: "#FFF3E0",
                borderWidth: 1,
                borderColor: "#FFE0B2",
                opacity: updating ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color="#F57C00"
                />
                <Text
                  style={{
                    color: "#F57C00",
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  Đang nghĩ lại sau
                </Text>
                {updating && <ActivityIndicator size="small" color="#F57C00" />}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

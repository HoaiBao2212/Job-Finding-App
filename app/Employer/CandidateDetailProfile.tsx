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
import EmployerSidebarLayout from "../Component/EmployerSidebarLayout";

interface CandidateProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  location: string;
  headline: string;
  summary: string;
  years_of_experience: number;
  desired_position: string;
  desired_job_type: string;
  desired_salary_min: number;
  desired_salary_max: number;
  salary_currency: string;
  preferred_locations: string;
  experiences: Array<{
    id: number;
    company_name: string;
    position: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    description: string;
  }>;
  educations: Array<{
    id: number;
    school_name: string;
    degree: string;
    major: string;
    start_date: string;
    end_date: string;
    gpa: number;
  }>;
  skills: Array<{
    id: number;
    name: string;
    level: number;
  }>;
}

export default function CandidateDetailProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const candidateId = params.candidateId
    ? parseInt(params.candidateId as string)
    : null;

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    if (candidateId) {
      loadCandidateProfile();
    } else {
      setLoading(false);
    }
  }, [candidateId]);

  const loadCandidateProfile = async () => {
    try {
      setLoading(true);

      // Get full candidate profile
      const { data: candProfile, error: profileError } = await supabase
        .from("candidate_profiles")
        .select(
          `
          id,
          user_id,
          headline,
          summary,
          years_of_experience,
          desired_position,
          desired_job_type,
          desired_salary_min,
          desired_salary_max,
          salary_currency,
          preferred_locations,
          user:profiles(
            full_name,
            email,
            phone,
            avatar_url,
            location
          )
        `
        )
        .eq("id", candidateId!)
        .single();

      if (profileError) throw profileError;

      const userProfile = Array.isArray(candProfile?.user)
        ? candProfile?.user?.[0]
        : candProfile?.user;

      if (candProfile) {
        // Get experiences
        const { data: experiences } = await supabase
          .from("candidate_experiences")
          .select("*")
          .eq("candidate_id", candProfile.id);

        // Get educations
        const { data: educations } = await supabase
          .from("candidate_educations")
          .select("*")
          .eq("candidate_id", candProfile.id);

        // Get skills
        const { data: skillsData } = await supabase
          .from("candidate_skills")
          .select("id, skill_id, level, skills(name)")
          .eq("candidate_id", candProfile.id);

        setCandidate({
          id: candProfile.id,
          full_name: userProfile?.full_name || "Ứng viên",
          email: userProfile?.email || "",
          phone: userProfile?.phone || "",
          avatar_url:
            userProfile?.avatar_url ||
            "https://i.pravatar.cc/150?img=default",
          location: userProfile?.location || "",
          headline: candProfile.headline || "",
          summary: candProfile.summary || "",
          years_of_experience: candProfile.years_of_experience || 0,
          desired_position: candProfile.desired_position || "",
          desired_job_type: candProfile.desired_job_type || "",
          desired_salary_min: candProfile.desired_salary_min || 0,
          desired_salary_max: candProfile.desired_salary_max || 0,
          salary_currency: candProfile.salary_currency || "VND",
          preferred_locations: candProfile.preferred_locations || "",
          experiences: experiences || [],
          educations: educations || [],
          skills: (skillsData || []).map((s: any) => ({
            id: s.id,
            name: s.skills?.name || "",
            level: s.level || 0,
          })),
        });
      }
    } catch (error) {
      console.error("Error loading candidate profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textGray }}>
              Đang tải thông tin...
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  if (!candidate) {
    return (
      <EmployerSidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: colors.textGray }}>
              Không tìm thấy hồ sơ
            </Text>
          </View>
        </SafeAreaView>
      </EmployerSidebarLayout>
    );
  }

  return (
    <EmployerSidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={{ backgroundColor: colors.primary, paddingBottom: 24 }}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.white,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Hồ sơ ứng viên
              </Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Profile Card */}
            <View style={{ paddingHorizontal: 16 }}>
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 20,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Image
                  source={{ uri: candidate.avatar_url }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    marginBottom: 12,
                    borderWidth: 3,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.white,
                    marginBottom: 4,
                  }}
                >
                  {candidate.full_name}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginBottom: 8,
                  }}
                >
                  {candidate.desired_position || "Ứng viên"}
                </Text>
                {candidate.location && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {candidate.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Content */}
          <View
            style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 }}
          >
            {/* Contact Info */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textGray,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Thông tin liên hệ
              </Text>
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                }}
              >
                {candidate.email && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: "#E7F5FF",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Email
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.email}
                      </Text>
                    </View>
                  </View>
                )}
                {candidate.phone && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: "#F6FFED",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="phone-outline"
                        size={18}
                        color="#52C41A"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Số điện thoại
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.phone}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Summary Section */}
            {candidate.summary && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: colors.textGray,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Giới thiệu
                </Text>
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textDark,
                      lineHeight: 20,
                    }}
                  >
                    {candidate.summary}
                  </Text>
                </View>
              </View>
            )}

            {/* Overview Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textGray,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Thông tin chung
              </Text>
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: colors.borderLight,
                  gap: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                }}
              >
                {candidate.headline && (
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={16}
                      color={colors.primary}
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Tiêu đề
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.headline}
                      </Text>
                    </View>
                  </View>
                )}
                {candidate.years_of_experience > 0 && (
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color="#FA8C16"
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Kinh nghiệm
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.years_of_experience} năm
                      </Text>
                    </View>
                  </View>
                )}
                {candidate.desired_job_type && (
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <MaterialCommunityIcons
                      name="briefcase-clock"
                      size={16}
                      color="#722ED1"
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Loại công việc mong muốn
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {candidate.desired_job_type === "full-time"
                          ? "Toàn thời gian"
                          : candidate.desired_job_type === "part-time"
                          ? "Bán thời gian"
                          : candidate.desired_job_type === "remote"
                          ? "Làm việc từ xa"
                          : candidate.desired_job_type === "hybrid"
                          ? "Kết hợp"
                          : candidate.desired_job_type === "internship"
                          ? "Thực tập"
                          : candidate.desired_job_type}
                      </Text>
                    </View>
                  </View>
                )}
                {(candidate.desired_salary_min > 0 ||
                  candidate.desired_salary_max > 0) && (
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <MaterialCommunityIcons
                      name="cash"
                      size={16}
                      color="#52C41A"
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Mức lương mong muốn
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.desired_salary_min.toLocaleString()} -{" "}
                        {candidate.desired_salary_max.toLocaleString()}{" "}
                        {candidate.salary_currency}
                      </Text>
                    </View>
                  </View>
                )}
                {candidate.preferred_locations && (
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={16}
                      color="#FF7875"
                      style={{ marginRight: 10, marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textGray,
                          marginBottom: 2,
                        }}
                      >
                        Vị trí ưa thích
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textDark,
                          fontWeight: "600",
                        }}
                      >
                        {candidate.preferred_locations}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Experience Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textGray,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Kinh nghiệm làm việc
              </Text>
              {candidate.experiences.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 32,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={32}
                    color={colors.textGray}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontWeight: "500",
                    }}
                  >
                    Không có kinh nghiệm
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {candidate.experiences.map((exp, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "#FFF1F0",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 12,
                            marginTop: 2,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="briefcase-outline"
                            size={18}
                            color="#FF7875"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: colors.textDark,
                              marginBottom: 2,
                            }}
                          >
                            {exp.position}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.textGray,
                            }}
                          >
                            {exp.company_name}
                          </Text>
                        </View>
                        {exp.is_current && (
                          <View
                            style={{
                              backgroundColor: "#F6FFED",
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: "#52C41A",
                              }}
                            >
                              Hiện tại
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginLeft: 48,
                          marginTop: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={12}
                          color={colors.textGray}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textGray,
                          }}
                        >
                          {exp.start_date
                            ? new Date(exp.start_date).getFullYear()
                            : ""}
                          {exp.end_date
                            ? ` - ${new Date(exp.end_date).getFullYear()}`
                            : " - Hiện tại"}
                        </Text>
                      </View>
                      {exp.description && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textGray,
                            marginTop: 8,
                            marginLeft: 48,
                            lineHeight: 16,
                          }}
                        >
                          {exp.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Education Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textGray,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Học vấn
              </Text>
              {candidate.educations.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 32,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={32}
                    color={colors.textGray}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontWeight: "500",
                    }}
                  >
                    Không có thông tin học vấn
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {candidate.educations.map((edu, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: "#F9F0FF",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 12,
                            marginTop: 2,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="school-outline"
                            size={18}
                            color="#722ED1"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: colors.textDark,
                              marginBottom: 2,
                            }}
                          >
                            {edu.degree} - {edu.major}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.textGray,
                            }}
                          >
                            {edu.school_name}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginLeft: 48,
                          marginTop: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={12}
                          color={colors.textGray}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textGray,
                          }}
                        >
                          {edu.start_date
                            ? new Date(edu.start_date).getFullYear()
                            : ""}{" "}
                          - {edu.end_date
                            ? new Date(edu.end_date).getFullYear()
                            : ""}
                        </Text>
                      </View>
                      {edu.gpa > 0 && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textGray,
                            marginTop: 8,
                            marginLeft: 48,
                          }}
                        >
                          GPA: {edu.gpa}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Skills Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textGray,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Kỹ năng
              </Text>
              {candidate.skills.length === 0 ? (
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 32,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                  }}
                >
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={32}
                    color={colors.textGray}
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontWeight: "500",
                    }}
                  >
                    Không có kỹ năng
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {candidate.skills.map((skill) => (
                      <View
                        key={skill.id}
                        style={{
                          backgroundColor: "#E7F5FF",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderWidth: 1,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.primary,
                          }}
                        >
                          {skill.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </EmployerSidebarLayout>
  );
}

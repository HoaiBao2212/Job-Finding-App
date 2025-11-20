import { authService } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { colors, Fonts } from "../../constants/theme";
import SidebarLayout from "../Component/SidebarLayout";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  location: string;
}

interface CandidateProfile {
  id: number;
  headline: string;
  summary: string;
  years_of_experience: number;
  desired_position: string;
  desired_job_type: string;
  preferred_locations: string;
}

interface Experience {
  id: number;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

interface Education {
  id: number;
  school_name: string;
  degree: string;
  major: string;
  start_date: string;
  end_date: string;
  gpa: number;
}

interface Skill {
  id: number;
  skill_id: number;
  level: number;
  skills: {
    name: string;
    category: string;
  };
}

export default function CandidateProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load candidate profile
      const { data: candidateData } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (candidateData) {
        setCandidateProfile(candidateData);
      }

      // Load experiences
      if (candidateData?.id) {
        const { data: expData } = await supabase
          .from("candidate_experiences")
          .select("*")
          .eq("candidate_id", candidateData.id)
          .order("is_current", { ascending: false })
          .order("start_date", { ascending: false });

        if (expData) {
          setExperiences(expData);
        }

        // Load educations
        const { data: eduData } = await supabase
          .from("candidate_educations")
          .select("*")
          .eq("candidate_id", candidateData.id)
          .order("end_date", { ascending: false });

        if (eduData) {
          setEducations(eduData);
        }

        // Load skills
        const { data: skillData } = await supabase
          .from("candidate_skills")
          .select(
            `
            id,
            skill_id,
            level,
            skills:skill_id (name, category)
          `
          )
          .eq("candidate_id", candidateData.id)
          .order("level", { ascending: false });

        if (skillData) {
          setSkills(skillData as unknown as Skill[]);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
      </SidebarLayout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSkillLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Cơ bản";
      case 2:
        return "Trung bình";
      case 3:
        return "Nâng cao";
      case 4:
        return "Chuyên gia";
      default:
        return "Không xác định";
    }
  };

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

        {/* Header with Back Button */}
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
          <TouchableOpacity
            onPress={() => router.push("/Candidate/JobFinding")}
            style={{
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
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
              fontSize: 18,
              fontWeight: "700",
              color: colors.white,
              flex: 1,
              textAlign: "center",
              fontFamily: Fonts.sans,
            }}
          >
            Hồ sơ
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 20,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{
                  uri:
                    profile?.avatar_url || "https://i.pravatar.cc/150?img=32",
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: colors.white,
                }}
              />
              <View style={{ alignItems: "center", marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: colors.white,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  {profile?.full_name || "Người dùng"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  {candidateProfile?.desired_position || "Vị trí mong muốn"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    marginTop: 6,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  📍 {profile?.location || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {candidateProfile?.years_of_experience || 0}+
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  Năm kinh nghiệm
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {skills.length}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  Kỹ năng
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {experiences.length}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: "center",
                    fontFamily: Fonts.sans,
                  }}
                >
                  Kinh nghiệm
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          {profile && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 12,
                  fontFamily: Fonts.sans,
                }}
              >
                Thông tin liên hệ
              </Text>
              {profile.email && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Email
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textDark,
                      maxWidth: "60%",
                      textAlign: "right",
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {profile.email}
                  </Text>
                </View>
              )}
              {profile.phone && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Số điện thoại
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textDark,
                      maxWidth: "60%",
                      textAlign: "right",
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {profile.phone}
                  </Text>
                </View>
              )}
              {profile.location && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Địa chỉ
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textDark,
                      maxWidth: "60%",
                      textAlign: "right",
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {profile.location}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Summary */}
          {candidateProfile?.summary && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 8,
                  fontFamily: Fonts.sans,
                }}
              >
                Giới thiệu
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textDark,
                  lineHeight: 18,
                  fontFamily: Fonts.sans,
                }}
              >
                {candidateProfile.summary}
              </Text>
            </View>
          )}

          {/* Job Preferences */}
          {candidateProfile && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 12,
                  fontFamily: Fonts.sans,
                }}
              >
                Tìm kiếm công việc
              </Text>
              {candidateProfile.desired_job_type && (
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Loại công việc
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {candidateProfile.desired_job_type
                      .split(",")
                      .map((type, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: colors.primarySoftBg,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.primary,
                              fontFamily: Fonts.sans,
                            }}
                          >
                            {type.trim()}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
              {candidateProfile.preferred_locations && (
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textGray,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Vị trí mong muốn
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {candidateProfile.preferred_locations
                      .split(",")
                      .map((loc, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: colors.primarySoftBg,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.primary,
                              fontFamily: Fonts.sans,
                            }}
                          >
                            {loc.trim()}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 12,
                  fontFamily: Fonts.sans,
                }}
              >
                Kỹ năng
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {skills.map((skill) => (
                  <View
                    key={skill.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.primarySoftBg,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: colors.primary,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {skill.skills?.name || "Kỹ năng"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.textGray,
                          marginTop: 2,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {getSkillLevelLabel(skill.level)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 12,
                  fontFamily: Fonts.sans,
                }}
              >
                Kinh nghiệm làm việc
              </Text>
              {experiences.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.textDark,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {exp.position}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.primary,
                          marginTop: 2,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {exp.company_name}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textGray,
                          fontFamily: Fonts.sans,
                        }}
                      >
                        {formatDate(exp.start_date)} -{" "}
                        {exp.is_current
                          ? "Hiện tại"
                          : formatDate(exp.end_date || "")}
                      </Text>
                      {exp.is_current && (
                        <View
                          style={{
                            backgroundColor: "#E8F8FF",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: colors.primary,
                              fontWeight: "600",
                              fontFamily: Fonts.sans,
                            }}
                          >
                            Đang làm
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {exp.description && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        marginTop: 8,
                        lineHeight: 16,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {exp.description}
                    </Text>
                  )}
                  {exp !== experiences[experiences.length - 1] && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.borderLight,
                        marginTop: 12,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Educations */}
          {educations.length > 0 && (
            <View
              style={{
                marginTop: 16,
                marginHorizontal: 16,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.borderLight,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: 12,
                  fontFamily: Fonts.sans,
                }}
              >
                Học vấn
              </Text>
              {educations.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textDark,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {edu.school_name}
                  </Text>
                  {edu.degree && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.primary,
                        marginTop: 4,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {edu.degree} - {edu.major}
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textGray,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {formatDate(edu.start_date)} -{" "}
                      {formatDate(edu.end_date || "")}
                    </Text>
                    {edu.gpa && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textDark,
                          fontWeight: "600",
                          fontFamily: Fonts.sans,
                        }}
                      >
                        GPA: {edu.gpa}
                      </Text>
                    )}
                  </View>
                  {edu !== educations[educations.length - 1] && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.borderLight,
                        marginTop: 12,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Edit Button */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              marginHorizontal: 16,
              marginBottom: 32,
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.push("/Candidate/EditProfile")}
          >
            <Text
              style={{
                color: colors.white,
                fontSize: 15,
                fontWeight: "600",
                fontFamily: Fonts.sans,
              }}
            >
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SidebarLayout>
  );
}

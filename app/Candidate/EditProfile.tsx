import { authService } from "@/lib/services/authService";
import { supabase } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, Fonts } from "../../constants/theme";
import AlertModal from "../Component/AlertModal";
import SidebarLayout from "../Component/SidebarLayout";
import { useAlert } from "../Component/useAlert.hook";

interface Skill {
  id: number;
  name: string;
  category: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlert();

  // Profile state
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profile, setProfile] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    location: "",
  });

  // Candidate profile state
  const [candidateProfile, setCandidateProfile] = React.useState({
    id: 0,
    headline: "",
    summary: "",
    years_of_experience: 0,
    desired_position: "",
    desired_job_type: "",
    preferred_locations: "",
    website: "",
  });

  // Skills & categories state
  const [skillCategories] = React.useState([
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
    { label: "Mobile", value: "mobile" },
    { label: "Database", value: "database" },
    { label: "DevOps / Cloud", value: "devops_cloud" },
    { label: "Data / AI", value: "data_ai" },
    { label: "Testing / QA", value: "testing" },
    { label: "Game", value: "game" },
    { label: "Khác", value: "other" },
  ]);

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = React.useState<number[]>([]);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  React.useEffect(() => {
    loadProfileData();
  }, []);

  React.useEffect(() => {
    const loadSkills = async () => {
      if (selectedCategories.length === 0) {
        setSkills([]);
        setSelectedSkillIds([]);
        return;
      }

      try {
        const { data } = await supabase
          .from("skills")
          .select("*")
          .in("category", selectedCategories);

        setSkills(data || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    loadSkills();
  }, [selectedCategories]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
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
        setCandidateProfile({
          ...candidateData,
          website: candidateData.website || "",
        });

        // Load candidate skills
        const { data: skillData } = await supabase
          .from("candidate_skills")
          .select("skill_id, skills(category)")
          .eq("candidate_id", candidateData.id);

        if (skillData && skillData.length > 0) {
          const skillIds = skillData.map((s: any) => s.skill_id);
          const categories = Array.from(
            new Set(skillData.map((s: any) => s.skills?.category))
          ).filter(Boolean) as string[];

          setSelectedSkillIds(skillIds);
          setSelectedCategories(categories);

          // Load all skills in these categories
          const { data: allSkills } = await supabase
            .from("skills")
            .select("*")
            .in("category", categories);

          setSkills(allSkills || []);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      showAlert("Lỗi", "Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!profile.full_name.trim() || !profile.email.trim()) {
        showAlert("Lỗi", "Vui lòng điền tên và email");
        return;
      }

      setSaving(true);

      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update candidate profile
      if (candidateProfile.id) {
        const { error: candError } = await supabase
          .from("candidate_profiles")
          .update({
            headline: candidateProfile.headline,
            summary: candidateProfile.summary,
            years_of_experience: candidateProfile.years_of_experience,
            desired_position: candidateProfile.desired_position,
            desired_job_type: candidateProfile.desired_job_type,
            preferred_locations: candidateProfile.preferred_locations,
            website: candidateProfile.website,
            updated_at: new Date().toISOString(),
          })
          .eq("id", candidateProfile.id);

        if (candError) throw candError;
      }

      // Update skills
      if (candidateProfile.id) {
        // Delete old skills
        await supabase
          .from("candidate_skills")
          .delete()
          .eq("candidate_id", candidateProfile.id);

        // Insert new skills
        if (selectedSkillIds.length > 0) {
          const skillsToInsert = selectedSkillIds.map((skillId) => ({
            candidate_id: candidateProfile.id,
            skill_id: skillId,
          }));

          const { error: skillError } = await supabase
            .from("candidate_skills")
            .insert(skillsToInsert);

          if (skillError) throw skillError;
        }
      }

      showAlert("Thành công", "Hồ sơ đã được cập nhật", [
        {
          text: "OK",
          onPress: () => {
            hideAlert();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      showAlert("Lỗi", "Có lỗi khi lưu hồ sơ: " + error?.message);
    } finally {
      setSaving(false);
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

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        const uri = result.assets[0].uri;
        const user = await authService.getCurrentUser();

        if (!user) {
          showAlert("Lỗi", "Vui lòng đăng nhập lại");
          return;
        }

        // Step 1: Fetch image and convert to blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Step 2: Upload image to Supabase Storage (Profile_avatar bucket)
        const fileName = `${user.id}-${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("Profile_avatar")
          .upload(fileName, blob, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          showAlert("Lỗi", "Không thể tải ảnh lên: " + uploadError.message);
          return;
        }

        console.log("Upload successful:", uploadData);

        // Step 3: Get public URL from uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("Profile_avatar")
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData?.publicUrl;
        console.log("Public URL:", publicUrl);

        if (publicUrl) {
          // Step 4: Save URL to database
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              avatar_url: publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("Database update error:", updateError);
            throw updateError;
          }

          // Step 5: Update local state
          setProfile({ ...profile, avatar_url: publicUrl });
          showAlert(
            "Thành công",
            "Ảnh đã được tải lên và cập nhật vào database"
          );
        }
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      showAlert("Lỗi", "Có lỗi khi tải ảnh lên: " + error?.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    numberOfLines = 1,
    icon,
    keyboardType = "default",
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    numberOfLines?: number;
    icon: string;
    keyboardType?: string;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.textDark,
            fontFamily: Fonts.sans,
          }}
        >
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textGray}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType as any}
        style={{
          backgroundColor: colors.white,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.borderLight,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 14,
          color: colors.textDark,
          fontFamily: Fonts.sans,
        }}
      />
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontSize: 16,
        fontWeight: "700",
        color: colors.textDark,
        marginBottom: 12,
        marginTop: 24,
        fontFamily: Fonts.sans,
      }}
    >
      {title}
    </Text>
  );

  return (
    <SidebarLayout>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgNeutral }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgNeutral} />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.white,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.textDark,
              fontFamily: Fonts.sans,
            }}
          >
            Chỉnh sửa hồ sơ
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 35 }}
        >
          {/* Avatar Section */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: colors.primary,
                  marginBottom: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 3,
                  borderColor: colors.primary,
                  marginBottom: 12,
                  backgroundColor: colors.primarySoftBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={50}
                  color={colors.textGray}
                />
              </View>
            )}
            <TouchableOpacity
              onPress={pickAndUploadImage}
              disabled={uploadingImage}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                opacity: uploadingImage ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name={uploadingImage ? "loading" : "camera"}
                  size={16}
                  color={colors.white}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "600",
                    fontSize: 13,
                    fontFamily: Fonts.sans,
                  }}
                >
                  {uploadingImage ? "Đang tải..." : "Thay đổi ảnh"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <SectionTitle title="Thông tin cá nhân" />

          <InputField
            label="Họ và tên"
            value={profile.full_name}
            onChangeText={(text) => setProfile({ ...profile, full_name: text })}
            placeholder="Nhập họ và tên"
            icon="account"
          />

          <InputField
            label="Email"
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Nhập email"
            icon="email"
          />

          <InputField
            label="Số điện thoại"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            placeholder="Nhập số điện thoại"
            icon="phone"
          />

          <InputField
            label="Địa điểm"
            value={profile.location}
            onChangeText={(text) => setProfile({ ...profile, location: text })}
            placeholder="Nhập địa điểm"
            icon="map-marker"
          />

          {/* Professional Information */}
          <SectionTitle title="Thông tin chuyên nghiệp" />

          <InputField
            label="Chuyên ngành / Tiêu đề công việc"
            value={candidateProfile.headline}
            onChangeText={(text) =>
              setCandidateProfile({ ...candidateProfile, headline: text })
            }
            placeholder="VD: React Native Developer"
            icon="briefcase"
          />

          <InputField
            label="Website cá nhân"
            value={candidateProfile.website}
            onChangeText={(text) =>
              setCandidateProfile({ ...candidateProfile, website: text })
            }
            placeholder="VD: https://myportfolio.com"
            icon="web"
            keyboardType="url"
          />

          <InputField
            label="Giới thiệu bản thân"
            value={candidateProfile.summary}
            onChangeText={(text) =>
              setCandidateProfile({ ...candidateProfile, summary: text })
            }
            placeholder="Viết về bản thân, kinh nghiệm, thành tích..."
            icon="pencil"
            multiline
            numberOfLines={4}
          />

          <InputField
            label="Vị trí mong muốn"
            value={candidateProfile.desired_position}
            onChangeText={(text) =>
              setCandidateProfile({
                ...candidateProfile,
                desired_position: text,
              })
            }
            placeholder="VD: Senior Developer, Tech Lead"
            icon="target"
          />

          <InputField
            label="Kinh nghiệm (năm)"
            value={candidateProfile.years_of_experience.toString()}
            onChangeText={(text) =>
              setCandidateProfile({
                ...candidateProfile,
                years_of_experience: parseInt(text) || 0,
              })
            }
            placeholder="0"
            icon="clock-outline"
            keyboardType="numeric"
          />

          <InputField
            label="Loại công việc mong muốn"
            value={candidateProfile.desired_job_type}
            onChangeText={(text) =>
              setCandidateProfile({
                ...candidateProfile,
                desired_job_type: text,
              })
            }
            placeholder="VD: Toàn thời gian, Bán thời gian"
            icon="briefcase-outline"
          />

          <InputField
            label="Địa điểm làm việc mong muốn"
            value={candidateProfile.preferred_locations}
            onChangeText={(text) =>
              setCandidateProfile({
                ...candidateProfile,
                preferred_locations: text,
              })
            }
            placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Remote"
            icon="map-marker-multiple"
          />

          {/* Skills Section */}
          <SectionTitle title="Kỹ năng" />

          {/* Category Picker */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.textDark,
                marginBottom: 8,
                fontFamily: Fonts.sans,
              }}
            >
              Chọn danh mục kỹ năng:
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {skillCategories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => toggleCategory(category.value)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: selectedCategories.includes(category.value)
                      ? colors.primary
                      : colors.primarySoftBg,
                    borderWidth: 1,
                    borderColor: selectedCategories.includes(category.value)
                      ? colors.primary
                      : colors.borderLight,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: selectedCategories.includes(category.value)
                        ? colors.white
                        : colors.textDark,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skills List */}
          {skills.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.textDark,
                  marginBottom: 8,
                  fontFamily: Fonts.sans,
                }}
              >
                Chọn kỹ năng:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {skills.map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    onPress={() => {
                      setSelectedSkillIds((prev) =>
                        prev.includes(skill.id)
                          ? prev.filter((id) => id !== skill.id)
                          : [...prev, skill.id]
                      );
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 6,
                      backgroundColor: selectedSkillIds.includes(skill.id)
                        ? colors.primary
                        : colors.primarySoftBg,
                      borderWidth: 1,
                      borderColor: selectedSkillIds.includes(skill.id)
                        ? colors.primary
                        : colors.borderLight,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: selectedSkillIds.includes(skill.id)
                          ? colors.white
                          : colors.textDark,
                        fontFamily: Fonts.sans,
                      }}
                    >
                      {skill.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 24,
              marginBottom: 32,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.primary,
                  fontFamily: Fonts.sans,
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator
                    size="small"
                    color={colors.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.white,
                      fontFamily: Fonts.sans,
                    }}
                  >
                    Đang lưu...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.white,
                    fontFamily: Fonts.sans,
                  }}
                >
                  Lưu thay đổi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <AlertModal
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
        />
      </SafeAreaView>
    </SidebarLayout>
  );
}

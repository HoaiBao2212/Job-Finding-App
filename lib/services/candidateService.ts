import { supabase } from "../supabase";

export interface CandidateProfile {
  id?: number;
  user_id: string;
  headline?: string;
  summary?: string;
  years_of_experience?: number;
  desired_position?: string;
  desired_salary_min?: number;
  desired_salary_max?: number;
  salary_currency?: string;
  desired_job_type?: string;
  preferred_locations?: string;
}

export interface CandidateExperience {
  id?: number;
  candidate_id: number;
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface CandidateEducation {
  id?: number;
  candidate_id: number;
  school_name: string;
  degree?: string;
  major?: string;
  start_date?: string;
  end_date?: string;
  gpa?: number;
}

export const candidateService = {
  // Lấy profile ứng viên
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Get candidate profile error:", error);
      throw error;
    }
  },

  // Tạo/cập nhật profile ứng viên
  async upsertProfile(profile: CandidateProfile) {
    try {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .upsert([profile], { onConflict: "user_id" })
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Upsert candidate profile error:", error);
      throw error;
    }
  },

  // Lấy kinh nghiệm làm việc
  async getExperiences(candidateId: number) {
    try {
      const { data, error } = await supabase
        .from("candidate_experiences")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get experiences error:", error);
      throw error;
    }
  },

  // Thêm kinh nghiệm
  async addExperience(experience: CandidateExperience) {
    try {
      const { data, error } = await supabase
        .from("candidate_experiences")
        .insert([experience])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Add experience error:", error);
      throw error;
    }
  },

  // Cập nhật kinh nghiệm
  async updateExperience(id: number, experience: Partial<CandidateExperience>) {
    try {
      const { data, error } = await supabase
        .from("candidate_experiences")
        .update(experience)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Update experience error:", error);
      throw error;
    }
  },

  // Xóa kinh nghiệm
  async deleteExperience(id: number) {
    try {
      const { error } = await supabase
        .from("candidate_experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Delete experience error:", error);
      throw error;
    }
  },

  // Lấy học vấn
  async getEducations(candidateId: number) {
    try {
      const { data, error } = await supabase
        .from("candidate_educations")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get educations error:", error);
      throw error;
    }
  },

  // Thêm học vấn
  async addEducation(education: CandidateEducation) {
    try {
      const { data, error } = await supabase
        .from("candidate_educations")
        .insert([education])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Add education error:", error);
      throw error;
    }
  },

  // Cập nhật học vấn
  async updateEducation(id: number, education: Partial<CandidateEducation>) {
    try {
      const { data, error } = await supabase
        .from("candidate_educations")
        .update(education)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Update education error:", error);
      throw error;
    }
  },

  // Xóa học vấn
  async deleteEducation(id: number) {
    try {
      const { error } = await supabase
        .from("candidate_educations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Delete education error:", error);
      throw error;
    }
  },

  // Lấy danh sách kỹ năng
  async getSkills(candidateId: number) {
    try {
      const { data, error } = await supabase
        .from("candidate_skills")
        .select("*, skills(*)")
        .eq("candidate_id", candidateId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get skills error:", error);
      throw error;
    }
  },

  // Thêm kỹ năng
  async addSkill(candidateId: number, skillId: number, level: number) {
    try {
      const { data, error } = await supabase
        .from("candidate_skills")
        .insert([{ candidate_id: candidateId, skill_id: skillId, level }])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Add skill error:", error);
      throw error;
    }
  },

  // Xóa kỹ năng
  async deleteSkill(id: number) {
    try {
      const { error } = await supabase
        .from("candidate_skills")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Delete skill error:", error);
      throw error;
    }
  },

  // Lưu công việc
  async saveJob(candidateId: number, jobId: number) {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .insert([{ candidate_id: candidateId, job_id: jobId }])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Save job error:", error);
      throw error;
    }
  },

  // Lấy danh sách công việc đã lưu
  async getSavedJobs(candidateId: number) {
    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("*, jobs(*)")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get saved jobs error:", error);
      throw error;
    }
  },

  // Bỏ lưu công việc
  async unsaveJob(candidateId: number, jobId: number) {
    try {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Unsave job error:", error);
      throw error;
    }
  },

  // Cập nhật avatar cho ứng viên
  async updateCandidateAvatar(userId: string, avatarUrl: string) {
    try {
      const { data, error } = await supabase
        .from("candidate_profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error("Update candidate avatar error:", error);
      throw error;
    }
  },
};

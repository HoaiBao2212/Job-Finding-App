import { supabase } from "@/lib/supabase";

export type Skill = {
  id: number;
  name: string;
  category: string;
  created_at?: string;
  updated_at?: string;
};

export const skillService = {
  // lấy skill theo nhiều category
  async getSkillsByCategories(categories: string[]): Promise<Skill[]> {
    if (categories.length === 0) return [];

    const { data, error } = await supabase
      .from("skills")
      .select("id, name, category")
      .in("category", categories)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []) as Skill[];
  },

  // lấy các skill đã gắn với 1 job
  async getSkillsByJob(jobId: number): Promise<Skill[]> {
    const { data, error } = await supabase
      .from("job_skills")
      .select("skills(id, name, category)")
      .eq("job_id", jobId);

    if (error) throw error;

    return (data || [])
      .map((row: any) => row.skills)
      .filter(Boolean) as Skill[];
  },

  // lưu lại danh sách skill cho job
  async saveJobSkills(jobId: number, skillIds: number[]) {
    // xóa hết skill cũ
    const { error: delError } = await supabase
      .from("job_skills")
      .delete()
      .eq("job_id", jobId);

    if (delError) throw delError;

    if (skillIds.length === 0) return;

    const rows = skillIds.map((skill_id) => ({
      job_id: jobId,
      skill_id,
    }));

    const { error: insError } = await supabase.from("job_skills").insert(rows);

    if (insError) throw insError;
  },
};

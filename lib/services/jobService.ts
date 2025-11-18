import { supabase } from '../supabase';

export interface JobPosting {
  id?: number;
  company_id: number;
  created_by_employer_id: number;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  job_type: string;
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  is_active?: boolean;
  deadline?: string | null;
}

export interface Application {
  id?: number;
  job_id: number;
  candidate_id: number;
  resume_id?: number;
  status?: 'applied' | 'reviewing' | 'interviewed' | 'offered' | 'rejected';
  applied_at?: string;
}

export const jobService = {
  // Lấy danh sách công việc
  async getJobs(filters?: {
    title?: string;
    location?: string;
    job_type?: string;
    experience_level?: string;
    company_id?: number;
  }) {
    try {
      let query = supabase
        .from('jobs')
        .select('*, companies(*), created_by_employer:employers(*)')
        .eq('is_active', true);

      if (filters?.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.job_type) {
        query = query.eq('job_type', filters.job_type);
      }
      if (filters?.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }
      if (filters?.company_id) {
        query = query.eq('company_id', filters.company_id);
      }

      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  },

  // Lấy chi tiết công việc
  async getJobById(id: number) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(*), job_skills(*, skills(*)), job_tag_relations(*, job_tags(*))')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Tăng view count
      await supabase
        .from('jobs')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

      return data;
    } catch (error) {
      console.error('Get job by id error:', error);
      throw error;
    }
  },

  // Tạo công việc
  async createJob(job: JobPosting) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  },

  // Cập nhật công việc
  async updateJob(id: number, job: Partial<JobPosting>) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(job)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Update job error:', error);
      throw error;
    }
  },

  // Xóa công việc
  async deleteJob(id: number) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete job error:', error);
      throw error;
    }
  },

  // Lấy danh sách công việc của nhà tuyển dụng
  async getEmployerJobs(employerId: number) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by_employer_id', employerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get employer jobs error:', error);
      throw error;
    }
  },

  // Lấy danh sách ứng tuyển cho công việc
  async getApplications(jobId: number) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, candidate_profiles(*, user:profiles(*)), resumes(*)')
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  },

  // Ứng tuyển công việc
  async applyJob(jobId: number, candidateId: number, resumeId?: number) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([
          {
            job_id: jobId,
            candidate_id: candidateId,
            resume_id: resumeId,
            status: 'applied',
          },
        ])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Apply job error:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái ứng tuyển
  async updateApplicationStatus(applicationId: number, status: string) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  },

  // Lấy danh sách kỹ năng
  async getSkills() {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get skills error:', error);
      throw error;
    }
  },

  // Tìm kiếm kỹ năng
  async searchSkills(query: string) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search skills error:', error);
      throw error;
    }
  },
};

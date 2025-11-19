import { supabase } from '../supabase';

export interface Company {
  id?: number;
  name: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  description?: string;
}

export interface Employer {
  id?: number;
  user_id: string;
  company_id: number;
  position?: string;
  is_company_admin?: boolean;
}

export const employerService = {
  // Tạo công ty
  async createCompany(company: Company) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Create company error:', error);
      throw error;
    }
  },

  // Lấy thông tin công ty
  async getCompany(id: number) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get company error:', error);
      throw error;
    }
  },

  // Cập nhật công ty
  async updateCompany(id: number, company: Partial<Company>) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  },

  // Tạo employer profile
  async createEmployerProfile(employer: Employer) {
    try {
      const { data, error } = await supabase
        .from('employers')
        .insert([employer])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Create employer profile error:', error);
      throw error;
    }
  },

  // Lấy employer profile
  async getEmployerProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*, companies(*)')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Get employer profile error:', error);
      return null;
    }
  },

  // Lấy danh sách employer của công ty
  async getCompanyEmployers(companyId: number) {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*, profiles(*)')
        .eq('company_id', companyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get company employers error:', error);
      throw error;
    }
  },

  // Lấy thống kê công việc
  async getJobStats(employerId: number) {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, is_active, view_count')
        .eq('created_by_employer_id', employerId);

      if (error) throw error;

      const jobIds = jobs?.map((j) => j.id) || [];
      let totalApplied = 0;

      if (jobIds.length > 0) {
        const { data: applications, error: appError } = await supabase
          .from('job_applications')
          .select('id')
          .in('job_id', jobIds);

        if (!appError) {
          totalApplied = applications?.length || 0;
        }
      }

      const stats = {
        total: jobs?.length || 0,
        active: jobs?.filter((j) => j.is_active).length || 0,
        totalApplied,
        totalViews: jobs?.reduce((sum, j) => sum + (j.view_count || 0), 0) || 0,
      };

      return stats;
    } catch (error) {
      console.error('Get job stats error:', error);
      throw error;
    }
  },

  // Lấy thống kê ứng tuyển
  async getApplicationStats(employerId: number) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('created_by_employer_id', employerId);

      if (error) throw error;

      const jobIds = data?.map((j) => j.id) || [];
      if (jobIds.length === 0) {
        return {
          total: 0,
          new: 0,
          reviewing: 0,
          interviewed: 0,
          offered: 0,
          rejected: 0,
        };
      }

      const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select('status')
        .in('job_id', jobIds);

      if (appError) throw appError;

      const stats = {
        total: applications?.length || 0,
        new: applications?.filter((a) => a.status === 'applied').length || 0,
        reviewing: applications?.filter((a) => a.status === 'reviewing').length || 0,
        interviewed: applications?.filter((a) => a.status === 'interviewed').length || 0,
        offered: applications?.filter((a) => a.status === 'offered').length || 0,
        rejected: applications?.filter((a) => a.status === 'rejected').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Get application stats error:', error);
      throw error;
    }
  },
};

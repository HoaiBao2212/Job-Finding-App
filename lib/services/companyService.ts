import { supabase } from '../supabase';

export interface Company {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  location?: string;
  industry?: string;
  created_at?: string;
  updated_at?: string;
}

export const companyService = {
  // Lấy danh sách tất cả công ty
  async getAllCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all companies error:', error);
      throw error;
    }
  },

  // Lấy công ty theo ID
  async getCompanyById(id: number) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get company by id error:', error);
      throw error;
    }
  },

  // Tìm kiếm công ty theo tên
  async searchCompanies(query: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search companies error:', error);
      throw error;
    }
  },

  // Tạo công ty
  async createCompany(company: Partial<Company>) {
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

  // Xóa công ty
  async deleteCompany(id: number) {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete company error:', error);
      throw error;
    }
  },

  // Lấy danh sách công ty theo employer ID
  async getEmployerCompanies(employerId: number) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by_employer_id', employerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get employer companies error:', error);
      throw error;
    }
  },

  // Lấy danh sách công ty với số lượng công việc
  async getCompaniesWithJobCount() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          jobs(id)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Thêm job_count vào mỗi công ty
      return (data || []).map((company: any) => ({
        ...company,
        job_count: company.jobs?.length || 0,
      }));
    } catch (error) {
      console.error('Get companies with job count error:', error);
      throw error;
    }
  },
};

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.candidate_educations (
  id bigint NOT NULL DEFAULT nextval('candidate_educations_id_seq'::regclass),
  candidate_id bigint NOT NULL,
  school_name text NOT NULL,
  degree text,
  major text,
  start_date date,
  end_date date,
  gpa numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_educations_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_educations_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id)
);
CREATE TABLE public.candidate_experiences (
  id bigint NOT NULL DEFAULT nextval('candidate_experiences_id_seq'::regclass),
  candidate_id bigint NOT NULL,
  company_name text NOT NULL,
  position text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_experiences_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_experiences_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id)
);
CREATE TABLE public.candidate_profiles (
  id bigint NOT NULL DEFAULT nextval('candidate_profiles_id_seq'::regclass),
  user_id uuid NOT NULL UNIQUE,
  headline text,
  summary text,
  years_of_experience integer,
  desired_position text,
  desired_salary_min integer,
  desired_salary_max integer,
  salary_currency text DEFAULT 'VND'::text,
  desired_job_type text CHECK (desired_job_type = ANY (ARRAY['full-time'::text, 'part-time'::text, 'remote'::text, 'hybrid'::text, 'internship'::text])),
  preferred_locations text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.candidate_skills (
  id bigint NOT NULL DEFAULT nextval('candidate_skills_id_seq'::regclass),
  candidate_id bigint NOT NULL,
  skill_id bigint NOT NULL,
  level smallint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT candidate_skills_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_skills_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id),
  CONSTRAINT candidate_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.companies (
  id bigint NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
  name text NOT NULL,
  logo_url text,
  industry text,
  company_size text,
  location text,
  website text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employers (
  id bigint NOT NULL DEFAULT nextval('employers_id_seq'::regclass),
  user_id uuid NOT NULL,
  company_id bigint NOT NULL,
  position text,
  is_company_admin boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT employers_pkey PRIMARY KEY (id),
  CONSTRAINT employers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT employers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.job_applications (
  id bigint NOT NULL DEFAULT nextval('job_applications_id_seq'::regclass),
  job_id bigint NOT NULL,
  candidate_id bigint NOT NULL,
  resume_id bigint,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'viewed'::text, 'shortlisted'::text, 'interview'::text, 'rejected'::text, 'hired'::text])),
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT job_applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id),
  CONSTRAINT job_applications_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id)
);
CREATE TABLE public.job_skills (
  id bigint NOT NULL DEFAULT nextval('job_skills_id_seq'::regclass),
  job_id bigint NOT NULL,
  skill_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_skills_pkey PRIMARY KEY (id),
  CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);
CREATE TABLE public.jobs (
  id bigint NOT NULL DEFAULT nextval('jobs_id_seq'::regclass),
  company_id bigint NOT NULL,
  created_by_employer_id bigint NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  location text,
  job_type text CHECK (job_type = ANY (ARRAY['full-time'::text, 'part-time'::text, 'internship'::text, 'remote'::text, 'hybrid'::text])),
  experience_level text CHECK (experience_level = ANY (ARRAY['junior'::text, 'mid'::text, 'senior'::text])),
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'VND'::text,
  is_active boolean NOT NULL DEFAULT true,
  deadline timestamp with time zone,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT jobs_created_by_employer_id_fkey FOREIGN KEY (created_by_employer_id) REFERENCES public.employers(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  email text UNIQUE,
  phone text,
  avatar_url text,
  role text DEFAULT 'candidate'::text CHECK (role = ANY (ARRAY['candidate'::text, 'employer'::text, 'admin'::text])),
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.resumes (
  id bigint NOT NULL DEFAULT nextval('resumes_id_seq'::regclass),
  candidate_id bigint NOT NULL,
  title text NOT NULL,
  file_url text,
  data_json jsonb,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id)
);
CREATE TABLE public.saved_jobs (
  id bigint NOT NULL DEFAULT nextval('saved_jobs_id_seq'::regclass),
  candidate_id bigint NOT NULL,
  job_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT saved_jobs_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id),
  CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.skills (
  id bigint NOT NULL DEFAULT nextval('skills_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
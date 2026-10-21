-- iC Clean Campus Database Schema (PostgreSQL & Supabase compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  gr_number TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'student' NOT NULL,
  area TEXT,
  points INTEGER DEFAULT 0 NOT NULL,
  streak INTEGER DEFAULT 1 NOT NULL,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cleaning Tasks Table
CREATE TABLE IF NOT EXISTS public.cleaning_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  area TEXT,
  priority TEXT DEFAULT 'medium' NOT NULL,
  staff_id BIGINT,
  status TEXT DEFAULT 'assigned' NOT NULL,
  before_photo TEXT,
  after_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  student_gr TEXT,
  problem TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  photo TEXT,
  after_photo TEXT,
  area TEXT,
  status TEXT DEFAULT 'submitted' NOT NULL,
  assigned_staff_id BIGINT,
  assigned_staff_name TEXT,
  pending_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recycle Requests Table
CREATE TABLE IF NOT EXISTS public.recycle_requests (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT,
  student_gr TEXT,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  photo TEXT,
  status TEXT DEFAULT 'Pending' NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (Supabase support)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role access users" ON public.users;
CREATE POLICY "Service role access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access tasks" ON public.cleaning_tasks;
CREATE POLICY "Service role access tasks" ON public.cleaning_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access reports" ON public.reports;
CREATE POLICY "Service role access reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access recycle" ON public.recycle_requests;
CREATE POLICY "Service role access recycle" ON public.recycle_requests FOR ALL USING (true) WITH CHECK (true);

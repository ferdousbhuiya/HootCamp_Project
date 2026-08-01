-- Create ongoing courses table with proper policy handling
-- This script handles existing policies gracefully

DO $$
BEGIN
    -- Create table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ongoing_courses' AND table_schema = 'public') THEN
        CREATE TABLE public.ongoing_courses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          course_name TEXT NOT NULL,
          provider TEXT,
          platform TEXT,
          start_date DATE,
          expected_completion_date DATE,
          progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
          url TEXT,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ongoing_courses' AND rowsecurity = true) THEN
        ALTER TABLE public.ongoing_courses ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own ongoing courses" ON public.ongoing_courses;
DROP POLICY IF EXISTS "Users can insert their own ongoing courses" ON public.ongoing_courses;
DROP POLICY IF EXISTS "Users can update their own ongoing courses" ON public.ongoing_courses;
DROP POLICY IF EXISTS "Users can delete their own ongoing courses" ON public.ongoing_courses;

-- Create policies
CREATE POLICY "Users can view their own ongoing courses"
  ON public.ongoing_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ongoing courses"
  ON public.ongoing_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ongoing courses"
  ON public.ongoing_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ongoing courses"
  ON public.ongoing_courses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ongoing_courses_user_id ON public.ongoing_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_ongoing_courses_status ON public.ongoing_courses(status);

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if not exists
DROP TRIGGER IF EXISTS update_ongoing_courses_updated_at ON public.ongoing_courses;
CREATE TRIGGER update_ongoing_courses_updated_at BEFORE UPDATE ON public.ongoing_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

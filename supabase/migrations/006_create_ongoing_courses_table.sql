-- Create ongoing_courses table
CREATE TABLE IF NOT EXISTS public.ongoing_courses (
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

-- Enable Row Level Security
ALTER TABLE public.ongoing_courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ongoing_courses_user_id ON public.ongoing_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_ongoing_courses_status ON public.ongoing_courses(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ongoing_courses_updated_at BEFORE UPDATE ON public.ongoing_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

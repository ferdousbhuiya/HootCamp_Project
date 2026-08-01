-- Create certificates table with proper policy handling
-- This script handles existing policies gracefully

DO $$
BEGIN
    -- Create table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') THEN
        CREATE TABLE public.certificates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          issuer TEXT,
          issue_date DATE,
          expiry_date DATE,
          credential_id TEXT,
          verification_url TEXT,
          verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'not_available')),
          file_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          storage_path TEXT,
          extracted_text TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'certificates' AND rowsecurity = true) THEN
        ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can update their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can delete their own certificates" ON public.certificates;

-- Create policies
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates"
  ON public.certificates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates"
  ON public.certificates FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_status ON public.certificates(verification_status);

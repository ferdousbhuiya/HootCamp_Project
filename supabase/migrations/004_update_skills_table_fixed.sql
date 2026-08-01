-- Update skills table to track verification source and related entities
-- This script handles existing columns gracefully

DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'verification_source') THEN
        ALTER TABLE public.skills ADD COLUMN verification_source TEXT DEFAULT 'manual' CHECK (verification_source IN ('manual', 'resume', 'certificate', 'ongoing_course'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'certificate_id') THEN
        ALTER TABLE public.skills ADD COLUMN certificate_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'ongoing_course_id') THEN
        ALTER TABLE public.skills ADD COLUMN ongoing_course_id UUID REFERENCES public.ongoing_courses(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'is_verified') THEN
        ALTER TABLE public.skills ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- Update existing skills to have proper verification_source
    UPDATE public.skills SET verification_source = 'manual' WHERE verification_source IS NULL;
END $$;

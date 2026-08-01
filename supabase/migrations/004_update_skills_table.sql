-- Update skills table to track verification source and related entities
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual' CHECK (verification_source IN ('manual', 'resume', 'certificate', 'ongoing_course')),
ADD COLUMN IF NOT EXISTS certificate_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ongoing_course_id UUID REFERENCES public.ongoing_courses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Update existing skills to have proper verification_source
UPDATE public.skills SET verification_source = 'manual' WHERE verification_source IS NULL;

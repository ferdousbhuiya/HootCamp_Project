-- Add missing columns to ongoing_courses (idempotent — safe to run repeatedly)
-- Run this in the Supabase SQL editor.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ongoing_courses' AND column_name = 'platform') THEN
        ALTER TABLE public.ongoing_courses ADD COLUMN platform TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ongoing_courses' AND column_name = 'start_date') THEN
        ALTER TABLE public.ongoing_courses ADD COLUMN start_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ongoing_courses' AND column_name = 'progress') THEN
        ALTER TABLE public.ongoing_courses ADD COLUMN progress NUMERIC DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ongoing_courses' AND column_name = 'url') THEN
        ALTER TABLE public.ongoing_courses ADD COLUMN url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ongoing_courses' AND column_name = 'description') THEN
        ALTER TABLE public.ongoing_courses ADD COLUMN description TEXT;
    END IF;
END $$;

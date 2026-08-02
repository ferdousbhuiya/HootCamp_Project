-- ============================================================
-- 009_goal_progress.sql
-- Goal progress tracking: active goal + baseline snapshot.
-- Idempotent — safe to run repeatedly in the Supabase SQL editor.
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_goals' AND column_name = 'is_active') THEN
        ALTER TABLE public.career_goals ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_goals' AND column_name = 'baseline') THEN
        ALTER TABLE public.career_goals ADD COLUMN baseline JSONB;
    END IF;
END $$;

-- Enforce exactly one active goal per user.
DROP INDEX IF EXISTS idx_career_goals_one_active;
CREATE UNIQUE INDEX idx_career_goals_one_active ON public.career_goals(user_id) WHERE is_active;

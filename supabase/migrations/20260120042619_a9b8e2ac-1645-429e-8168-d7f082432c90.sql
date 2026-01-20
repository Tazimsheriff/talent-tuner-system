-- Add structured fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS min_experience_years INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_score_threshold INTEGER DEFAULT 60;

-- Add shortlisting and analysis summary to candidates table
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS is_shortlisted BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS analysis_summary TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shortlisted_by UUID DEFAULT NULL;

-- Create index for faster shortlist queries
CREATE INDEX IF NOT EXISTS idx_candidates_shortlisted ON public.candidates(job_id, is_shortlisted);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON public.candidates(job_id, match_score DESC);
-- Create jobs table to store job descriptions
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table to store resume data
CREATE TABLE public.candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    skills TEXT[],
    education TEXT,
    experience TEXT,
    resume_text TEXT,
    resume_file_path TEXT,
    match_score DECIMAL(5,2),
    key_matches TEXT[],
    missing_skills TEXT[],
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs - users can only manage their own jobs
CREATE POLICY "Users can view their own jobs" 
ON public.jobs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for candidates - through job ownership
CREATE POLICY "Users can view candidates for their jobs" 
ON public.candidates FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = candidates.job_id 
    AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can create candidates for their jobs" 
ON public.candidates FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = job_id 
    AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can update candidates for their jobs" 
ON public.candidates FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = candidates.job_id 
    AND jobs.user_id = auth.uid()
));

CREATE POLICY "Users can delete candidates for their jobs" 
ON public.candidates FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE jobs.id = candidates.job_id 
    AND jobs.user_id = auth.uid()
));

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Storage policies for resume uploads
CREATE POLICY "Users can upload resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their resumes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for jobs table
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
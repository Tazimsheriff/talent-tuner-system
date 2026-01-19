-- Allow job seekers to view all jobs (for browsing)
CREATE POLICY "Job seekers can view all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'job_seeker'));

-- Allow job seekers to insert candidates (apply to jobs)
CREATE POLICY "Job seekers can apply to jobs"
ON public.candidates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'job_seeker'));
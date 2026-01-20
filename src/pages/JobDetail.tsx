import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Upload, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import CandidateList from "@/components/CandidateList";
import CandidateFilters, { FilterState } from "@/components/CandidateFilters";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  required_skills: string[] | null;
  min_experience_years: number | null;
  education_level: string | null;
  min_score_threshold: number | null;
  created_at: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[] | null;
  education: string | null;
  experience: string | null;
  match_score: number | null;
  key_matches: string[] | null;
  missing_skills: string[] | null;
  status: string | null;
  created_at: string;
  is_shortlisted: boolean | null;
  analysis_summary: string | null;
}

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    scoreRange: [0, 100],
    skillSearch: "",
    experienceSearch: "",
    shortlistStatus: "all",
  });

  useEffect(() => {
    if (jobId) {
      fetchJobAndCandidates();
    }
  }, [jobId]);

  const fetchJobAndCandidates = async () => {
    try {
      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .eq("job_id", jobId)
        .order("match_score", { ascending: false, nullsFirst: false });

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchJobAndCandidates();
    toast({
      title: "Resumes processed",
      description: "Candidates have been analyzed and ranked.",
    });
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Score range filter
      const score = candidate.match_score ?? 0;
      if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) {
        return false;
      }

      // Shortlist status filter
      if (filters.shortlistStatus === "shortlisted" && candidate.is_shortlisted !== true) {
        return false;
      }
      if (filters.shortlistStatus === "rejected" && candidate.is_shortlisted !== false) {
        return false;
      }
      if (filters.shortlistStatus === "pending" && candidate.is_shortlisted !== null) {
        return false;
      }

      // Skill search filter
      if (filters.skillSearch.trim()) {
        const searchTerms = filters.skillSearch.toLowerCase().split(",").map(s => s.trim());
        const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
        const hasMatchingSkill = searchTerms.some(term => 
          candidateSkills.some(skill => skill.includes(term))
        );
        if (!hasMatchingSkill) return false;
      }

      // Experience search filter
      if (filters.experienceSearch.trim()) {
        const searchTerm = filters.experienceSearch.toLowerCase();
        const experience = (candidate.experience || "").toLowerCase();
        if (!experience.includes(searchTerm)) return false;
      }

      return true;
    });
  }, [candidates, filters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    if (filters.skillSearch.trim()) count++;
    if (filters.experienceSearch.trim()) count++;
    if (filters.shortlistStatus !== "all") count++;
    return count;
  }, [filters]);

  // Stats
  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlisted = candidates.filter(c => c.is_shortlisted === true).length;
    const rejected = candidates.filter(c => c.is_shortlisted === false).length;
    const pending = candidates.filter(c => c.is_shortlisted === null).length;
    const autoQualified = candidates.filter(c => 
      c.is_shortlisted === null && 
      c.match_score && 
      c.match_score >= (job?.min_score_threshold || 60)
    ).length;
    return { total, shortlisted, rejected, pending, autoQualified };
  }, [candidates, job?.min_score_threshold]);

  const getEducationLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      high_school: "High School",
      associate: "Associate Degree",
      bachelor: "Bachelor's Degree",
      master: "Master's Degree",
      phd: "PhD / Doctorate",
    };
    return level ? labels[level] || level : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground mt-1">
                Created {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Resumes
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{stats.shortlisted}</p>
                  <p className="text-xs text-muted-foreground">Shortlisted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{stats.autoQualified}</p>
                  <p className="text-xs text-muted-foreground">Auto-qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Description */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
                {job.requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Structured Requirements Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Screening Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Required Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Required Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {job.min_experience_years !== null && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Minimum Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.min_experience_years === 0 ? "Entry level" : `${job.min_experience_years}+ years`}
                    </p>
                  </div>
                )}

                {/* Education */}
                {job.education_level && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Education Level</h4>
                    <p className="text-sm text-muted-foreground">
                      {getEducationLabel(job.education_level)}
                    </p>
                  </div>
                )}

                {/* Score Threshold */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-1 text-sm">Auto-Shortlist Threshold</h4>
                  <p className="text-sm">
                    <span className="text-primary font-semibold">{job.min_score_threshold || 60}%</span>
                    <span className="text-muted-foreground ml-1">match score</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Candidates Section */}
          <div className="lg:col-span-2">
            {showUpload && (
              <Card className="mb-6 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeUpload 
                    jobId={job.id}
                    jobDescription={job.description}
                    jobRequirements={job.requirements}
                    onComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">
                  Candidates ({filteredCandidates.length}
                  {filteredCandidates.length !== candidates.length && ` of ${candidates.length}`})
                </h2>
              </div>
              <CandidateFilters
                filters={filters}
                onFiltersChange={setFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {candidates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No candidates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload resumes to start screening candidates for this position
                  </p>
                  <Button onClick={() => setShowUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resumes
                  </Button>
                </CardContent>
              </Card>
            ) : filteredCandidates.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No matching candidates</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more candidates
                  </p>
                </CardContent>
              </Card>
            ) : (
              <CandidateList 
                candidates={filteredCandidates} 
                onCandidateUpdated={fetchJobAndCandidates}
                minScoreThreshold={job.min_score_threshold || 60}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
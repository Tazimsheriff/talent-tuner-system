import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Upload } from "lucide-react";
import ResumeUpload from "@/components/ResumeUpload";
import CandidateList from "@/components/CandidateList";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
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
}

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

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
        .single();

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Description */}
          <div className="lg:col-span-1">
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

            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                Candidates ({candidates.length})
              </h2>
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
            ) : (
              <CandidateList 
                candidates={candidates} 
                onCandidateDeleted={fetchJobAndCandidates}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;

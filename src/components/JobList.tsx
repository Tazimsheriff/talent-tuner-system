import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Users, Trash2, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  created_at: string;
  candidateCount?: number;
}

interface JobListProps {
  jobs: Job[];
  onJobDeleted: () => void;
}

const JobList = ({ jobs, onJobDeleted }: JobListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      
      if (error) throw error;
      
      toast({
        title: "Job deleted",
        description: "The job posting has been removed.",
      });
      onJobDeleted();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job posting",
      });
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="hover:shadow-md transition-shadow cursor-pointer group"
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div 
                className="flex-1"
                onClick={() => navigate(`/job/${job.id}`)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 ml-12">
                  {job.description}
                </p>
                <div className="flex items-center gap-4 mt-3 ml-12">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.candidateCount || 0} candidates</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the job posting and all associated candidates. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(job.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/job/${job.id}`)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobList;

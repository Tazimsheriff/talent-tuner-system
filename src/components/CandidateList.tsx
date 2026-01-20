import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, ChevronDown, ChevronUp, Mail, Phone, GraduationCap, 
  Briefcase, CheckCircle, XCircle, Sparkles 
} from "lucide-react";
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

interface CandidateListProps {
  candidates: Candidate[];
  onCandidateUpdated: () => void;
  minScoreThreshold?: number;
}

const getScoreColor = (score: number | null) => {
  if (!score) return "bg-muted text-muted-foreground";
  if (score >= 90) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (score >= 75) return "bg-blue-100 text-blue-800 border-blue-200";
  if (score >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
};

const getScoreLabel = (score: number | null) => {
  if (!score) return "Pending";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Moderate";
  return "Low";
};

const CandidateList = ({ candidates, onCandidateUpdated, minScoreThreshold = 60 }: CandidateListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (candidateId: string) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);

      if (error) throw error;

      toast({
        title: "Candidate removed",
        description: "The candidate has been removed from this job.",
      });
      onCandidateUpdated();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove candidate",
      });
    }
  };

  const handleShortlist = async (candidateId: string, shortlist: boolean) => {
    setUpdatingId(candidateId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("candidates")
        .update({
          is_shortlisted: shortlist,
          shortlisted_at: shortlist ? new Date().toISOString() : null,
          shortlisted_by: shortlist ? user?.id : null,
        })
        .eq("id", candidateId);

      if (error) throw error;

      toast({
        title: shortlist ? "Candidate shortlisted" : "Candidate rejected",
        description: shortlist 
          ? "The candidate has been added to your shortlist." 
          : "The candidate has been marked as rejected.",
      });
      onCandidateUpdated();
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update candidate status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getShortlistBadge = (candidate: Candidate) => {
    if (candidate.is_shortlisted === true) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
          <CheckCircle className="h-3 w-3" />
          Shortlisted
        </Badge>
      );
    }
    if (candidate.is_shortlisted === false) {
      return (
        <Badge variant="outline" className="border-red-200 text-red-700 gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    // Check if auto-shortlist applies
    if (candidate.match_score && candidate.match_score >= minScoreThreshold) {
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-700 gap-1">
          <Sparkles className="h-3 w-3" />
          Auto-qualified
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {candidates.map((candidate, index) => (
        <Card 
          key={candidate.id} 
          className={`animate-fade-in ${
            candidate.is_shortlisted === true 
              ? "border-emerald-200 bg-emerald-50/30" 
              : candidate.is_shortlisted === false 
                ? "border-red-200 bg-red-50/30 opacity-75" 
                : ""
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {index + 1}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      {getShortlistBadge(candidate)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {candidate.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </span>
                      )}
                      {candidate.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {candidate.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score !== null ? `${candidate.match_score}%` : "—"}
                      <span className="ml-1 text-xs opacity-75">
                        {getScoreLabel(candidate.match_score)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {candidate.analysis_summary && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <Sparkles className="h-3 w-3" />
                      AI Analysis
                    </div>
                    <p className="text-sm">{candidate.analysis_summary}</p>
                  </div>
                )}

                {/* Skills Preview */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {candidate.skills.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Expanded Details */}
                {expandedId === candidate.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Experience */}
                    {candidate.experience && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Experience
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {candidate.experience}
                        </p>
                      </div>
                    )}

                    {/* Education */}
                    {candidate.education && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          Education
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {candidate.education}
                        </p>
                      </div>
                    )}

                    {/* Key Matches */}
                    {candidate.key_matches && candidate.key_matches.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-emerald-700">
                          ✓ Key Matches
                        </p>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {candidate.key_matches.map((match, i) => (
                            <Badge key={i} className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              {match}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {candidate.missing_skills && candidate.missing_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-amber-700">
                          ⚠ Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {candidate.missing_skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="border-amber-200 text-amber-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Skills */}
                    {candidate.skills && candidate.skills.length > 5 && (
                      <div>
                        <p className="text-sm font-medium mb-2">All Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                  >
                    {expandedId === candidate.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        More
                      </>
                    )}
                  </Button>

                  {/* Shortlist/Reject Buttons */}
                  {candidate.is_shortlisted !== true && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => handleShortlist(candidate.id, true)}
                      disabled={updatingId === candidate.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Shortlist
                    </Button>
                  )}
                  
                  {candidate.is_shortlisted !== false && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => handleShortlist(candidate.id, false)}
                      disabled={updatingId === candidate.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}

                  {/* Undo button if already decided */}
                  {candidate.is_shortlisted !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShortlist(candidate.id, null as any)}
                      disabled={updatingId === candidate.id}
                    >
                      Undo
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {candidate.name} from this job posting. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(candidate.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CandidateList;
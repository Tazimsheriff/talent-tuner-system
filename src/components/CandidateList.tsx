import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ChevronDown, ChevronUp, Mail, Phone, GraduationCap, Briefcase } from "lucide-react";
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
}

interface CandidateListProps {
  candidates: Candidate[];
  onCandidateDeleted: () => void;
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

const CandidateList = ({ candidates, onCandidateDeleted }: CandidateListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      onCandidateDeleted();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove candidate",
      });
    }
  };

  return (
    <div className="space-y-3">
      {candidates.map((candidate, index) => (
        <Card 
          key={candidate.id} 
          className="animate-fade-in"
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
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
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
                <div className="flex items-center gap-2 mt-4">
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

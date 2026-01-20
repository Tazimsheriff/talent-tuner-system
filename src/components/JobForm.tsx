import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

interface JobFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const JobForm = ({ onSuccess, onCancel }: JobFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [minExperienceYears, setMinExperienceYears] = useState<number | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [minScoreThreshold, setMinScoreThreshold] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.from("jobs").insert({
        title,
        description,
        requirements: requirements || null,
        required_skills: requiredSkills,
        min_experience_years: minExperienceYears,
        education_level: educationLevel,
        min_score_threshold: minScoreThreshold,
        user_id: user.id,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create job posting",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Senior Software Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements (Free-text)</Label>
        <Textarea
          id="requirements"
          placeholder="List specific skills, qualifications, or experience required..."
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={4}
        />
      </div>

      {/* Structured Skills */}
      <div className="space-y-2">
        <Label>Required Skills</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill (e.g., React, Python)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" variant="outline" onClick={handleAddSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {requiredSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Experience & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum Experience (Years)</Label>
          <Select
            value={minExperienceYears?.toString() || "any"}
            onValueChange={(v) => setMinExperienceYears(v === "any" ? null : parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any experience</SelectItem>
              <SelectItem value="0">Entry level (0-1 years)</SelectItem>
              <SelectItem value="2">2+ years</SelectItem>
              <SelectItem value="3">3+ years</SelectItem>
              <SelectItem value="5">5+ years</SelectItem>
              <SelectItem value="7">7+ years</SelectItem>
              <SelectItem value="10">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Education Level</Label>
          <Select
            value={educationLevel || "any"}
            onValueChange={(v) => setEducationLevel(v === "any" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any education" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any education</SelectItem>
              <SelectItem value="high_school">High School</SelectItem>
              <SelectItem value="associate">Associate Degree</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD / Doctorate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cut-off Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Auto-Shortlist Threshold</Label>
          <span className="text-sm font-medium text-primary">{minScoreThreshold}%</span>
        </div>
        <Slider
          value={[minScoreThreshold]}
          onValueChange={([v]) => setMinScoreThreshold(v)}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Candidates with a match score ≥ {minScoreThreshold}% will be auto-shortlisted
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job Posting"}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
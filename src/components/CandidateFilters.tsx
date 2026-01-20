import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface FilterState {
  scoreRange: [number, number];
  skillSearch: string;
  experienceSearch: string;
  shortlistStatus: "all" | "shortlisted" | "rejected" | "pending";
}

interface CandidateFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  activeFilterCount: number;
}

const CandidateFilters = ({ filters, onFiltersChange, activeFilterCount }: CandidateFiltersProps) => {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      scoreRange: [0, 100],
      skillSearch: "",
      experienceSearch: "",
      shortlistStatus: "all",
    });
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filter Candidates
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </SheetTitle>
          <SheetDescription>
            Narrow down candidates by score, skills, and more
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Shortlist Status */}
          <div className="space-y-2">
            <Label>Shortlist Status</Label>
            <Select
              value={filters.shortlistStatus}
              onValueChange={(v) => updateFilter("shortlistStatus", v as FilterState["shortlistStatus"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Match Score Range</Label>
              <span className="text-sm text-muted-foreground">
                {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
              </span>
            </div>
            <Slider
              value={filters.scoreRange}
              onValueChange={(v) => updateFilter("scoreRange", v as [number, number])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Skill Search */}
          <div className="space-y-2">
            <Label htmlFor="skillSearch">Search by Skill</Label>
            <Input
              id="skillSearch"
              placeholder="e.g., React, Python, AWS"
              value={filters.skillSearch}
              onChange={(e) => updateFilter("skillSearch", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Search for candidates with specific skills
            </p>
          </div>

          {/* Experience Search */}
          <div className="space-y-2">
            <Label htmlFor="experienceSearch">Search by Experience</Label>
            <Input
              id="experienceSearch"
              placeholder="e.g., manager, senior, startup"
              value={filters.experienceSearch}
              onChange={(e) => updateFilter("experienceSearch", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Search within experience descriptions
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={() => setOpen(false)} className="w-full">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CandidateFilters;
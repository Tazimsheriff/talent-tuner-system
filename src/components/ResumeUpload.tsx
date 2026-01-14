import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface ResumeUploadProps {
  jobId: string;
  jobDescription: string;
  jobRequirements: string | null;
  onComplete: () => void;
}

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "analyzing" | "complete" | "error";
  error?: string;
}

const ResumeUpload = ({ jobId, jobDescription, jobRequirements, onComplete }: ResumeUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf" || 
               file.type === "application/msword" ||
               file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
               file.type === "text/plain"
    );
    
    setFiles((prev) => [
      ...prev,
      ...droppedFiles.map((file) => ({ file, status: "pending" as const })),
    ]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [
        ...prev,
        ...selectedFiles.map((file) => ({ file, status: "pending" as const })),
      ]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For text files, read directly
    if (file.type === "text/plain") {
      return await file.text();
    }
    
    // For PDF/DOC files, we'll send the raw text content
    // In a production app, you'd use a proper parser
    // For now, we'll read what we can and let AI handle it
    const text = await file.text();
    return text || `[Resume file: ${file.name}]`;
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setProgress(0);
    
    const totalFiles = files.length;
    let processedCount = 0;
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = files[i];
      
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" } : f
          )
        );

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Upload file to storage
        const filePath = `${user.id}/${jobId}/${Date.now()}-${uploadedFile.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, uploadedFile.file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
        }

        // Update status to analyzing
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "analyzing" } : f
          )
        );

        // Extract text from file
        const resumeText = await extractTextFromFile(uploadedFile.file);

        // Call AI analysis
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
          "analyze-resume",
          {
            body: {
              resumeText,
              jobDescription,
              jobRequirements,
            },
          }
        );

        if (analysisError) {
          throw new Error(analysisError.message || "Analysis failed");
        }

        if (analysisData.error) {
          throw new Error(analysisData.error);
        }

        // Save candidate to database
        const { error: insertError } = await supabase.from("candidates").insert({
          job_id: jobId,
          name: analysisData.name || uploadedFile.file.name.replace(/\.[^/.]+$/, ""),
          email: analysisData.email,
          phone: analysisData.phone,
          skills: analysisData.skills,
          education: analysisData.education,
          experience: analysisData.experience,
          resume_text: resumeText.substring(0, 10000), // Limit stored text
          resume_file_path: filePath,
          match_score: analysisData.matchScore,
          key_matches: analysisData.keyMatches,
          missing_skills: analysisData.missingSkills,
          status: "analyzed",
        });

        if (insertError) {
          throw new Error("Failed to save candidate");
        }

        // Update status to complete
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "complete" } : f
          )
        );
        successCount++;

      } catch (error) {
        console.error("Error processing file:", error);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "Unknown error" }
              : f
          )
        );
      }

      processedCount++;
      setProgress((processedCount / totalFiles) * 100);
    }

    setProcessing(false);
    
    if (successCount > 0) {
      toast({
        title: "Processing complete",
        description: `Successfully processed ${successCount} of ${totalFiles} resumes.`,
      });
      onComplete();
    } else {
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "No resumes could be processed. Please try again.",
      });
    }
  };

  const pendingFiles = files.filter((f) => f.status === "pending");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop resume files here, or
        </p>
        <label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button variant="outline" size="sm" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Supports PDF, DOC, DOCX, and TXT files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {files.length} file(s) selected
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.status === "pending" && "Ready to process"}
                      {file.status === "uploading" && "Uploading..."}
                      {file.status === "analyzing" && "Analyzing with AI..."}
                      {file.status === "complete" && "✓ Complete"}
                      {file.status === "error" && `✗ ${file.error}`}
                    </p>
                  </div>
                </div>
                {file.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {(file.status === "uploading" || file.status === "analyzing") && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {processing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground text-center">
            Processing resumes... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Process Button */}
      {pendingFiles.length > 0 && !processing && (
        <Button onClick={processFiles} className="w-full">
          Process {pendingFiles.length} Resume(s)
        </Button>
      )}
    </div>
  );
};

export default ResumeUpload;

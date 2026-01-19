import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, Zap, ArrowRight, Briefcase } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check user role and redirect appropriately
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (roleData?.role === 'hr') {
          navigate("/dashboard");
        } else if (roleData?.role === 'job_seeker') {
          navigate("/jobs");
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">TalentScreen AI</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/login")}>
              <Briefcase className="h-4 w-4 mr-2" />
              Find Jobs
            </Button>
            <Button onClick={() => navigate("/hr/login")}>
              HR Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Screen Resumes
          <span className="text-primary"> 10x Faster</span>
          <br />with AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload your job description and candidate resumes. Our AI analyzes skills, 
          experience, and contextual fit to rank candidates instantly.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate("/hr/login")}>
            Start Screening (HR)
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            <Briefcase className="h-4 w-4 mr-2" />
            Find Jobs
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Resume Parsing</h3>
            <p className="text-muted-foreground">
              AI extracts skills, education, experience, and contact info from any resume format.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Contextual Matching</h3>
            <p className="text-muted-foreground">
              Goes beyond keywords to understand transferable skills and relevant experience.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ranked Results</h3>
            <p className="text-muted-foreground">
              Get candidates ranked by match score with insights on strengths and gaps.
            </p>
          </div>
        </div>
      </section>

      {/* Two-column CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* HR CTA */}
          <div className="bg-primary rounded-2xl p-8 text-center">
            <Users className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary-foreground mb-3">
              For HR Professionals
            </h2>
            <p className="text-primary-foreground/80 mb-6">
              Screen candidates faster with AI-powered resume analysis and ranking.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/hr/login")}
            >
              HR Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Job Seeker CTA */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-center">
            <Briefcase className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              For Job Seekers
            </h2>
            <p className="text-white/80 mb-6">
              Browse job opportunities and apply with just a few clicks.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/login")}
            >
              Find Jobs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 TalentScreen AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
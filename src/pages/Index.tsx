import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, Zap, ArrowRight, Briefcase, Cpu, Scan, Binary } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-neon-purple/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg neon-glow-pink">
              <Cpu className="h-6 w-6 text-primary animate-flicker" />
            </div>
            <span className="text-xl font-display font-bold tracking-wider text-foreground">
              TALENT<span className="text-primary">SCREEN</span>
            </span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent font-body font-semibold"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              FIND JOBS
            </Button>
            <Button 
              onClick={() => navigate("/hr/login")}
              className="bg-primary hover:bg-primary/80 neon-glow-pink font-display font-medium tracking-wide"
            >
              HR ACCESS
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero - Asymmetric Layout */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left content - takes 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <p className="font-mono text-sm text-accent tracking-widest uppercase">
                // NEXT_GEN RECRUITMENT PROTOCOL
              </p>
              <h1 className="text-5xl md:text-7xl font-display font-black leading-none tracking-tight">
                <span className="text-foreground">SCREEN</span>
                <br />
                <span className="text-gradient-cyber neon-text-pink">RESUMES</span>
                <br />
                <span className="text-foreground">AT</span>
                <span className="text-primary neon-text-pink ml-4">10X</span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl font-body text-muted-foreground max-w-xl leading-relaxed">
              Neural networks analyze skills, decode experience patterns, and 
              <span className="text-accent"> rank candidates</span> in milliseconds.
            </p>

            <div className="flex gap-4 flex-wrap pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/hr/login")}
                className="bg-primary hover:bg-primary/80 neon-glow-pink font-display font-bold tracking-wider text-lg px-8 py-6"
              >
                INITIALIZE SCREEN
                <Scan className="h-5 w-5 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="border-accent text-accent hover:bg-accent/10 font-display font-medium tracking-wide px-8 py-6"
              >
                <Binary className="h-5 w-5 mr-3" />
                JOB MATRIX
              </Button>
            </div>
          </div>

          {/* Right side - Decorative glassy panel */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-strong rounded-2xl p-8 relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative space-y-6">
                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-pink">
                    <span className="font-display font-black text-2xl text-primary">10x</span>
                  </div>
                  <div>
                    <p className="font-display text-sm text-muted-foreground">SPEED_BOOST</p>
                    <p className="font-body text-lg text-foreground">Faster Screening</p>
                  </div>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-accent/20 flex items-center justify-center neon-glow-cyan">
                    <span className="font-display font-black text-2xl text-accent">AI</span>
                  </div>
                  <div>
                    <p className="font-display text-sm text-muted-foreground">NEURAL_NET</p>
                    <p className="font-body text-lg text-foreground">Deep Analysis</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-neon-purple/20 flex items-center justify-center neon-glow-purple">
                    <span className="font-display font-black text-2xl text-neon-purple">∞</span>
                  </div>
                  <div>
                    <p className="font-display text-sm text-muted-foreground">SCALE_MODE</p>
                    <p className="font-body text-lg text-foreground">Unlimited Candidates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Asymmetric grid */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Large feature card */}
          <div className="md:col-span-4 glass rounded-2xl p-8 group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 group-hover:neon-glow-pink transition-all duration-300">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-bold tracking-wide">
                  NEURAL PARSE<span className="text-primary">_</span>ENGINE
                </h3>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  Advanced algorithms extract and decode skills, credentials, experience matrices, 
                  and contact protocols from any resume format. PDF, DOC, or raw data streams.
                </p>
              </div>
            </div>
          </div>

          {/* Small feature card */}
          <div className="md:col-span-2 glass rounded-2xl p-6 flex flex-col justify-center group hover:border-accent/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mb-4 group-hover:neon-glow-cyan transition-all duration-300">
              <Zap className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">CONTEXT_MATCH</h3>
            <p className="font-body text-muted-foreground">
              Beyond keywords. Understands transferable skills and hidden potential.
            </p>
          </div>

          {/* Small feature card */}
          <div className="md:col-span-2 glass rounded-2xl p-6 flex flex-col justify-center group hover:border-success/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(160_100%_45%/0.5)] transition-all duration-300">
              <BarChart3 className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">RANK_PROTOCOL</h3>
            <p className="font-body text-muted-foreground">
              Instant scoring with strength and gap analytics.
            </p>
          </div>

          {/* Medium feature card */}
          <div className="md:col-span-4 glass rounded-2xl p-8 group hover:border-neon-purple/50 transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-purple/10 flex items-center justify-center shrink-0 group-hover:neon-glow-purple transition-all duration-300">
                <Users className="h-10 w-10 text-neon-purple" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-bold tracking-wide">
                  TALENT<span className="text-neon-purple">_</span>DISCOVERY
                </h3>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  Surface hidden gems in your candidate pool. Our AI identifies non-obvious 
                  matches that traditional keyword filters miss entirely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column CTA - Asymmetric */}
      <section className="relative z-10 container mx-auto px-4 py-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* HR CTA - Larger */}
          <div className="md:col-span-3 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative glass-strong rounded-2xl p-10 border border-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative">
                <Users className="h-14 w-14 text-primary mb-6 neon-glow-pink" />
                <h2 className="text-3xl font-display font-black mb-4 tracking-wide">
                  HR<span className="text-primary">_</span>PROTOCOL
                </h2>
                <p className="font-body text-lg text-muted-foreground mb-8 max-w-md">
                  Initialize your screening matrix. Upload candidates, configure requirements, 
                  let the neural net do the heavy lifting.
                </p>
                <Button 
                  size="lg"
                  onClick={() => navigate("/hr/login")}
                  className="bg-primary hover:bg-primary/80 neon-glow-pink font-display font-bold tracking-wider"
                >
                  ACCESS HR PORTAL
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Job Seeker CTA - Smaller, offset */}
          <div className="md:col-span-2 relative group md:mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/50 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative glass-strong rounded-2xl p-8 border border-accent/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
              <div className="relative">
                <Briefcase className="h-12 w-12 text-accent mb-5" />
                <h2 className="text-2xl font-display font-black mb-3 tracking-wide">
                  JOB<span className="text-accent">_</span>SEEKER
                </h2>
                <p className="font-body text-muted-foreground mb-6">
                  Browse the job matrix. Find your next gig.
                </p>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-accent text-accent hover:bg-accent/10 font-display font-medium tracking-wide w-full"
                >
                  ENTER MATRIX
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 glass py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="font-display text-sm tracking-wider text-muted-foreground">
              TALENTSCREEN_AI
            </span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            // SYS.VERSION_2026 :: ALL_RIGHTS_RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

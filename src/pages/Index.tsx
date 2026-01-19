import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, FileText, BarChart3, Zap, ArrowRight, Briefcase, Cpu, Scan, Binary } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = containerRef.current.scrollTop;
      const layers = containerRef.current.querySelectorAll('[data-parallax]');
      
      layers.forEach((layer) => {
        const speed = parseFloat((layer as HTMLElement).dataset.parallax || '0');
        (layer as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
      });
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto overflow-x-hidden bg-background relative"
    >
      {/* Parallax Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep background - City grid */}
        <div 
          data-parallax="0.1"
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, transparent 0%, hsl(220 25% 4%) 100%),
              repeating-linear-gradient(
                to right,
                transparent,
                transparent 100px,
                hsl(56 100% 50% / 0.03) 100px,
                hsl(56 100% 50% / 0.03) 101px
              ),
              repeating-linear-gradient(
                to bottom,
                transparent,
                transparent 100px,
                hsl(56 100% 50% / 0.03) 100px,
                hsl(56 100% 50% / 0.03) 101px
              )
            `,
            backgroundSize: 'cover, 100px 100px, 100px 100px',
          }}
        />

        {/* Mid layer - Glowing orbs */}
        <div data-parallax="0.3" className="absolute inset-0">
          <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" />
          <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[120px]" />
          <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-neon-pink/8 rounded-full blur-[100px]" />
        </div>

        {/* Horizon glow */}
        <div 
          data-parallax="0.2"
          className="absolute bottom-0 left-0 right-0 h-[40%]"
          style={{
            background: `linear-gradient(to top, hsl(56 100% 50% / 0.08), transparent)`
          }}
        />

        {/* Scanlines overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              hsl(56 100% 50% / 0.5) 2px,
              hsl(56 100% 50% / 0.5) 4px
            )`
          }}
        />

        {/* Floating geometric shapes */}
        <div data-parallax="0.5" className="absolute inset-0">
          <div className="absolute top-[20%] left-[5%] w-32 h-32 border border-primary/20 rotate-45 animate-pulse-slow" />
          <div className="absolute top-[70%] left-[80%] w-24 h-24 border border-neon-cyan/15 rotate-12" />
          <div className="absolute top-[40%] left-[90%] w-16 h-16 border border-primary/10 -rotate-12" />
        </div>

        {/* Grid perspective */}
        <div 
          data-parallax="0.15"
          className="absolute bottom-0 left-0 right-0 h-[50vh]"
          style={{
            background: `
              linear-gradient(to top, hsl(220 25% 4% / 0.9) 0%, transparent 100%),
              linear-gradient(to bottom, transparent 0%, hsl(56 100% 50% / 0.05) 100%)
            `,
            backgroundSize: '100% 100%',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, hsl(56 100% 50% / 0.1) 1px, transparent 1px),
                linear-gradient(hsl(56 100% 50% / 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '80px 40px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 glass">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg neon-glow-yellow">
                <Cpu className="h-6 w-6 text-primary animate-flicker" />
              </div>
              <span className="text-xl font-display font-bold tracking-wider text-foreground">
                TALENT<span className="text-primary neon-text-yellow">SCREEN</span>
              </span>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-body font-semibold"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                FIND JOBS
              </Button>
              <Button 
                onClick={() => navigate("/hr/login")}
                className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow-yellow font-display font-medium tracking-wide"
              >
                HR ACCESS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero - Asymmetric Layout */}
        <section className="container mx-auto px-4 py-16 md:py-24 min-h-[80vh] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left content - takes 7 columns */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-2">
                <p className="font-mono text-sm text-neon-cyan tracking-widest uppercase">
                  // NEXT_GEN RECRUITMENT PROTOCOL
                </p>
                <h1 className="text-5xl md:text-7xl font-display font-black leading-none tracking-tight">
                  <span className="text-foreground">SCREEN</span>
                  <br />
                  <span className="text-gradient-cyber neon-text-yellow">RESUMES</span>
                  <br />
                  <span className="text-foreground">AT</span>
                  <span className="text-primary neon-text-yellow ml-4">10X</span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl font-body text-muted-foreground max-w-xl leading-relaxed">
                Neural networks analyze skills, decode experience patterns, and 
                <span className="text-neon-cyan"> rank candidates</span> in milliseconds.
              </p>

              <div className="flex gap-4 flex-wrap pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/hr/login")}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow-yellow font-display font-bold tracking-wider text-lg px-8 py-6"
                >
                  INITIALIZE SCREEN
                  <Scan className="h-5 w-5 ml-3" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-display font-medium tracking-wide px-8 py-6"
                >
                  <Binary className="h-5 w-5 mr-3" />
                  JOB MATRIX
                </Button>
              </div>
            </div>

            {/* Right side - Decorative glassy panel */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="glass-strong rounded-2xl p-8 relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-neon-cyan/5" />
                <div className="relative space-y-6">
                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-yellow">
                      <span className="font-display font-black text-2xl text-primary">10x</span>
                    </div>
                    <div>
                      <p className="font-display text-sm text-muted-foreground">SPEED_BOOST</p>
                      <p className="font-body text-lg text-foreground">Faster Screening</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-neon-cyan/20 flex items-center justify-center neon-glow-cyan">
                      <span className="font-display font-black text-2xl text-neon-cyan">AI</span>
                    </div>
                    <div>
                      <p className="font-display text-sm text-muted-foreground">NEURAL_NET</p>
                      <p className="font-body text-lg text-foreground">Deep Analysis</p>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-neon-pink/20 flex items-center justify-center neon-glow-pink">
                      <span className="font-display font-black text-2xl text-neon-pink">∞</span>
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
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Large feature card */}
            <div className="md:col-span-4 glass rounded-2xl p-8 group hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 group-hover:neon-glow-yellow transition-all duration-300">
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
            <div className="md:col-span-2 glass rounded-2xl p-6 flex flex-col justify-center group hover:border-neon-cyan/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/10 flex items-center justify-center mb-4 group-hover:neon-glow-cyan transition-all duration-300">
                <Zap className="h-7 w-7 text-neon-cyan" />
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
            <div className="md:col-span-4 glass rounded-2xl p-8 group hover:border-neon-pink/50 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-neon-pink/30 to-neon-pink/10 flex items-center justify-center shrink-0 group-hover:neon-glow-pink transition-all duration-300">
                  <Users className="h-10 w-10 text-neon-pink" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-bold tracking-wide">
                    TALENT<span className="text-neon-pink">_</span>DISCOVERY
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
        <section className="container mx-auto px-4 py-16 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* HR CTA - Larger */}
            <div className="md:col-span-3 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative glass-strong rounded-2xl p-10 border border-primary/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative">
                  <Users className="h-14 w-14 text-primary mb-6 neon-glow-yellow" />
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
                    className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow-yellow font-display font-bold tracking-wider"
                  >
                    ACCESS HR PORTAL
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Job Seeker CTA - Smaller, offset */}
            <div className="md:col-span-2 relative group md:mt-12">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-cyan/50 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative glass-strong rounded-2xl p-8 border border-neon-cyan/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl" />
                <div className="relative">
                  <Briefcase className="h-12 w-12 text-neon-cyan mb-5" />
                  <h2 className="text-2xl font-display font-black mb-3 tracking-wide">
                    JOB<span className="text-neon-cyan">_</span>SEEKER
                  </h2>
                  <p className="font-body text-muted-foreground mb-6">
                    Browse the job matrix. Find your next gig.
                  </p>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-display font-medium tracking-wide w-full"
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
        <footer className="border-t border-border/50 glass py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="font-display text-sm tracking-wider text-muted-foreground">
                TALENTSCREEN_AI
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              // SYS.VERSION_2077 :: ALL_RIGHTS_RESERVED
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

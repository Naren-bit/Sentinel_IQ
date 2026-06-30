import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/StepCard";
import { Search, ShieldCheck, CheckCircle, Shield, UploadCloud, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";

export function Landing() {
  const { setScreen } = useStore();

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      
      <main className="max-w-[1440px] mx-auto px-10 pt-40 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-[8px] bg-[var(--surface-container-low)] border border-[var(--surface-container)] text-[var(--primary)] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            AI Powered
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--on-surface)] tracking-tight leading-[1.1] mb-6">
            Enterprise PII Review at the <br/>
            <span className="text-[var(--primary)]">Speed of Thought</span>
          </h1>
          
          <p className="text-lg text-[var(--on-surface-variant)] leading-[1.6] max-w-2xl mx-auto mb-10">
            Automate detection, redaction, and compliance auditing with precision AI designed for high-volume, sensitive document workflows.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              className="rounded-[20px] px-8 py-6 text-base font-medium bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-[0_4px_20px_rgba(0,88,190,0.2)] transition-all hover:-translate-y-0.5 group"
              onClick={() => setScreen('upload')}
            >
              <UploadCloud className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-[20px] w-full animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 fill-mode-both">
          <StepCard 
            title="Detect"
            description="Instantly identify 150+ types of Personally Identifiable Information across unstructured text, PDFs, and images with 99.8% accuracy."
            icon={Search}
            colorClass="text-[var(--primary)] bg-[var(--surface-container)] border-[var(--primary)]"
            delayClass=""
          />
          <StepCard 
            title="Verify"
            description="Human-in-the-loop interface allows rapid review of flagged items, learning from your corrections to improve future detection."
            icon={ShieldCheck}
            colorClass="text-[var(--tertiary)] bg-[var(--tertiary-fixed)] border-[var(--tertiary)]"
            delayClass="animation-delay-2000"
          />
          <StepCard 
            title="Prioritize"
            description="Automatically score and route documents based on risk severity, ensuring your team focuses on critical compliance tasks first."
            icon={CheckCircle}
            colorClass="text-[var(--secondary)] bg-[var(--secondary-fixed)] border-[var(--secondary-container)]"
            delayClass="animation-delay-4000"
          />
        </div>

        {/* CTA Banner */}
        <div className="mt-32 w-full max-w-4xl relative overflow-hidden bg-white/30 backdrop-blur-[24px] border border-white/40 hover:border-white/60 hover:bg-white/40 hover:shadow-[0_24px_60px_rgba(31,41,55,0.12)] rounded-[32px] shadow-[0_12px_40px_rgba(31,41,55,0.08)] p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-[var(--on-surface)] mb-4">Ready to secure your data?</h2>
            <p className="text-[var(--on-surface-variant)] mb-8 w-full max-w-[600px] mx-auto text-lg">
              Join industry leaders using SentinelIQ to streamline their compliance workflows.
            </p>
            <Button 
              className="rounded-[20px] px-8 py-6 text-base bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-md transition-transform hover:-translate-y-0.5"
              onClick={() => setScreen('upload')}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full max-w-[1440px] mx-auto px-10 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-[var(--on-surface-variant)] z-10 relative">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Shield className="w-4 h-4" />
          <span className="font-semibold">SentinelIQ</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Security Architecture</a>
        </div>
        <div className="mt-4 md:mt-0">
          © 2024 SentinelIQ Enterprise AI
        </div>
      </footer>
    </div>
  );
}

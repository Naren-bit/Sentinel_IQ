import { Button } from "@/components/ui/button";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";

export function Complete() {
  const { documentName, detections, reset } = useStore();

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[var(--surface-container-high)] opacity-60 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full bg-white/80 backdrop-blur-[20px] rounded-[24px] border border-[var(--outline-variant)]/50 p-12 text-center shadow-[0_12px_40px_rgba(31,41,55,0.08)] animate-in zoom-in-95 duration-500 relative z-10">
        <div className="w-24 h-24 bg-[var(--tertiary-fixed)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-[var(--tertiary)]" />
        </div>
        
        <h2 className="text-3xl font-bold text-[var(--on-surface)] mb-4 tracking-tight">Review Complete</h2>
        <p className="text-[var(--on-surface-variant)] mb-10 text-lg leading-relaxed">
          You&apos;ve successfully reviewed all {detections.length} detections in <br/>
          <span className="font-semibold text-[var(--on-surface)] mt-2 inline-block px-3 py-1 bg-[var(--surface-container-low)] rounded-[8px] border border-[var(--outline-variant)]/30">
            {documentName}
          </span>
        </p>

        <Button 
          onClick={reset}
          className="w-full rounded-[20px] py-6 text-base font-medium bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-md transition-transform hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Review Another Document
        </Button>
      </div>
    </div>
  );
}

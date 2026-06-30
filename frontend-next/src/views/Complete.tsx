import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RotateCcw, Download, Eye, EyeOff, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export function Complete() {
  const { documentName, detections, approvedIds, dismissedIds, getRedactedText, reset } = useStore();
  const [showPreview, setShowPreview] = useState(false);

  const redactedCount = approvedIds.size;
  const revealedCount = dismissedIds.size;
  const redactedText = getRedactedText();

  const handleDownload = () => {
    const blob = new Blob([redactedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = documentName.replace(/\.[^.]+$/, '') || 'document';
    a.href = url;
    a.download = `${baseName}_redacted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Main Card */}
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-[20px] rounded-[24px] border border-[var(--outline-variant)]/50 p-12 text-center shadow-[0_12px_40px_rgba(31,41,55,0.08)] animate-in zoom-in-95 duration-500 relative z-10">
        <div className="w-24 h-24 bg-[var(--tertiary-fixed)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-[var(--tertiary)]" />
        </div>
        
        <h2 className="text-3xl font-bold text-[var(--on-surface)] mb-4 tracking-tight">Review Complete</h2>
        <p className="text-[var(--on-surface-variant)] mb-6 text-lg leading-relaxed">
          You&apos;ve successfully reviewed all {detections.length} detections in <br/>
          <span className="font-semibold text-[var(--on-surface)] mt-2 inline-block px-3 py-1 bg-[var(--surface-container-low)] rounded-[8px] border border-[var(--outline-variant)]/30">
            {documentName}
          </span>
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[16px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-emerald-700">{redactedCount}</div>
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Redacted</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-amber-700">{revealedCount}</div>
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Dismissed</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleDownload}
            className="w-full rounded-[20px] py-6 text-base font-medium bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Redacted Document
          </Button>

          <Button 
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full rounded-[20px] py-6 text-base font-medium border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
          >
            {showPreview ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Preview Redacted Document'}
          </Button>

          <Button 
            variant="outline"
            onClick={reset}
            className="w-full rounded-[20px] py-6 text-base font-medium border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Review Another Document
          </Button>
        </div>
      </div>

      {/* Redacted Document Preview */}
      {showPreview && (
        <div className="max-w-4xl w-full mt-8 bg-white/80 backdrop-blur-[20px] rounded-[24px] border border-[var(--outline-variant)]/50 shadow-[0_12px_40px_rgba(31,41,55,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 overflow-hidden">
          <div className="px-8 py-5 border-b border-[var(--outline-variant)]/40 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[var(--on-surface-variant)]" />
              <span className="font-semibold text-[var(--on-surface)]">Redacted Document Preview</span>
            </div>
            <span className="text-xs text-[var(--on-surface-variant)] font-medium px-3 py-1 bg-[var(--surface-container-low)] rounded-full">
              {redactedCount} redaction{redactedCount !== 1 ? 's' : ''} applied
            </span>
          </div>
          <div className="p-8 max-h-[60vh] overflow-auto">
            <RedactedPreview text={redactedText} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Renders the redacted text with [REDACTED — TYPE] blocks visually highlighted */
function RedactedPreview({ text }: { text: string }) {
  // Split text around [REDACTED — ...] blocks
  const parts = text.split(/(\[REDACTED — [A-Z]+\])/g);

  return (
    <div className="font-mono text-sm leading-[2] whitespace-pre-wrap text-[var(--on-surface-variant)]">
      {parts.map((part, i) => {
        if (part.match(/^\[REDACTED — [A-Z]+\]$/)) {
          return (
            <span
              key={i}
              className="inline-block bg-slate-900 text-white font-bold px-2 py-0.5 rounded-[6px] text-xs tracking-wide mx-0.5 shadow-sm"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

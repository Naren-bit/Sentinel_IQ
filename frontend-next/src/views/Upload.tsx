import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, Loader2, AlertCircle, Zap, FileSpreadsheet } from "lucide-react";
import { useStore } from "@/lib/store";
import { reviewDocument, uploadDocument } from "@/lib/api";

export function Upload() {
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setLoading, setError, setReviewData, loading, error } = useStore();

  const handleAction = async (action: () => Promise<unknown>, defaultName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await action() as {
        detections?: { id: string; text: string; type: string; start: number; end: number; confidence?: number; source?: string }[];
        enrichments?: { detectionId: string; priorityTier: string; reasons: string[]; drivingSignal?: string }[];
        fileName?: string;
        documentText?: string;
        fallbackOccurred?: boolean;
      };
      const rawDetections = data.detections || [];
      const enrichments = data.enrichments || [];
      
      const mergedDetections = rawDetections.map((det: { id: string; text: string; type: string; start: number; end: number; confidence?: number; source?: string }) => {
        const enrichment = enrichments.find((e: { detectionId: string; priorityTier: string; reasons: string[]; drivingSignal?: string }) => e.detectionId === det.id) || {
          priorityTier: 'LOW',
          reasons: [],
          drivingSignal: undefined
        };
        return {
          detectionId: det.id,
          text: det.text,
          type: det.type,
          start: det.start,
          end: det.end,
          priorityTier: enrichment.priorityTier as 'LOW' | 'STANDARD' | 'HIGH',
          reasons: enrichment.reasons,
          drivingSignal: enrichment.drivingSignal,
          confidence: det.confidence,
          source: det.source,
        };
      });

      setReviewData({
        name: data.fileName || defaultName,
        text: data.documentText || "",
        detections: mergedDetections,
        fallbackOccurred: data.fallbackOccurred
      });
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
      setLoading(false);
    }
  };

  const onFileSelected = (file: File) => {
    if (file) {
      handleAction(() => uploadDocument(file), file.name);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-sans">
      <main className="flex-1 overflow-auto px-6 pt-32 pb-12 relative z-10">
          <div className="max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <h2 className="text-[32px] font-bold text-[var(--on-surface)] mb-8">Start a Review</h2>

            {error && (
              <div className="mb-8 bg-[var(--error-container)] border border-[var(--error)]/20 text-[var(--on-error-container)] p-4 rounded-[8px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 fill-[var(--error)] text-white" />
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* File Upload Zone */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-[24px] border border-white/40 rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] p-8 flex flex-col h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                <h3 className="font-semibold text-lg text-[var(--on-surface)] mb-6 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-[var(--primary)]" />
                  Upload Document
                </h3>
                
                <div 
                  className={`flex-1 border-2 border-dashed rounded-[16px] flex flex-col items-center justify-center p-6 text-center transition-all ${dragActive ? 'border-[var(--primary)] bg-[var(--surface-container-low)]' : 'border-[var(--outline-variant)] bg-white/50 hover:bg-white hover:border-[var(--primary)]/50'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.[0]) onFileSelected(e.dataTransfer.files[0]);
                  }}
                >
                  <div className="w-16 h-16 bg-[var(--surface-container-low)] rounded-full flex items-center justify-center mb-4 text-[var(--primary-container)]">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <p className="text-[var(--on-surface-variant)] text-sm mb-4 max-w-[200px]">
                    Drag & drop your file here, or click to browse.
                  </p>
                  
                  <div className="flex gap-2 mb-6">
                    <span className="px-2 py-1 bg-[var(--surface-container)] text-[var(--on-surface-variant)] text-[10px] font-bold rounded uppercase">PDF</span>
                    <span className="px-2 py-1 bg-[var(--surface-container)] text-[var(--on-surface-variant)] text-[10px] font-bold rounded uppercase">DOCX</span>
                    <span className="px-2 py-1 bg-[var(--surface-container)] text-[var(--on-surface-variant)] text-[10px] font-bold rounded uppercase">TXT</span>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) onFileSelected(e.target.files[0]);
                    }}
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    variant="outline"
                    className="w-full rounded-[20px] bg-white border-[var(--outline-variant)] hover:border-[var(--primary)] text-[var(--primary)]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Browse Files
                  </Button>
                </div>
                </div>
              </div>

              {/* Paste Text Zone */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-[24px] border border-[var(--primary)]/30 rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] p-8 flex flex-col h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                <h3 className="font-semibold text-lg text-[var(--on-surface)] mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                  Paste Text
                </h3>
                <textarea 
                  className="w-full flex-1 p-4 rounded-[12px] border border-[var(--outline-variant)] bg-white text-sm resize-none focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] mb-6 transition-all"
                  placeholder="Paste document content here..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  className="w-full rounded-[20px] bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm"
                  disabled={!pasteText.trim() || loading}
                  onClick={() => handleAction(() => reviewDocument(pasteText), "pasted_text.txt")}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Analyze Text
                </Button>
                </div>
              </div>

              {/* Quick Start Zone */}
              <div className="relative overflow-hidden bg-white/30 backdrop-blur-[24px] border border-white/40 rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] p-8 flex flex-col h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--tertiary)]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg text-[var(--on-surface)] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[var(--tertiary)]" />
                    Quick Start
                  </h3>
                  <span className="px-3 py-1 bg-[var(--tertiary-fixed)] text-[var(--tertiary)] text-[10px] font-bold rounded-[8px] uppercase tracking-wide">
                    Recommended for Demo
                  </span>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <button 
                    disabled={loading}
                    className="w-full p-6 text-left border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)] rounded-[16px] transition-all group"
                    onClick={() => handleAction(() => reviewDocument("", "demo"), "demo_document.txt")}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileSpreadsheet className="w-6 h-6 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)] transition-colors" />
                      <span className="font-semibold text-[var(--on-surface)] text-lg">Sample Financial Report</span>
                    </div>
                    <p className="text-sm text-[var(--on-surface-variant)] pl-9">
                      Contains synthetic PII for testing.
                    </p>
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
      {/* Footer */}
      <footer className="px-10 py-6 border-t border-[var(--outline-variant)]/40 flex justify-between items-center text-xs text-[var(--on-surface-variant)] bg-white/50 backdrop-blur-md">
        <div className="font-semibold">
          © 2024 SentinelIQ Enterprise AI
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--on-surface)] transition-colors">Security Architecture</a>
        </div>
      </footer>
    </div>
  );
}

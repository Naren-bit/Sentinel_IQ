import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DetectionCard } from "@/components/DetectionCard";
import { 
  FileText, 
  List, 
  CheckCircle2, 
  AlertCircle, 
  Monitor, 
  Shield, 
  Search, 
  HelpCircle, 
  Settings, 
  History,
  FileDigit
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ReviewView() {
  const { documentName, detections, reviewedIds, markReviewed, bulkApprove, viewEnteredAt, fallbackOccurred, reset } = useStore();
  const [activeTab, setActiveTab] = useState("queue");
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");

  const pendingDetections = useMemo(() => {
    return detections.filter(d => !reviewedIds.has(d.detectionId))
      .sort((a, b) => {
        const order = { 'HIGH': 0, 'STANDARD': 1, 'LOW': 2 };
        return order[a.priorityTier] - order[b.priorityTier];
      });
  }, [detections, reviewedIds]);

  const reviewedDetections = useMemo(() => {
    return detections.filter(d => reviewedIds.has(d.detectionId));
  }, [detections, reviewedIds]);

  const handleBulkApprove = () => {
    const elapsedSeconds = (Date.now() - (viewEnteredAt || Date.now())) / 1000;
    
    if (elapsedSeconds < 3 && pendingDetections.length > 3) {
      setNudgeMessage("Please take a moment to actually read the highlighted items before approving.");
      setNudgeVisible(true);
      return;
    }
    
    if (pendingDetections.some(d => d.priorityTier === 'HIGH')) {
      setNudgeMessage("There are HIGH priority items remaining. Are you sure you want to bulk approve?");
      setNudgeVisible(true);
      if (nudgeVisible) {
        bulkApprove();
        setNudgeVisible(false);
      }
      return;
    }

    bulkApprove();
  };

  useEffect(() => {
    if (nudgeVisible) {
      const t = setTimeout(() => setNudgeVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [nudgeVisible]);

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans flex relative overflow-hidden">
        
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-[var(--outline-variant)]/40 flex flex-col z-20 shadow-sm shrink-0 pt-28">
          <div className="p-6 border-b border-[var(--outline-variant)]/40">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[8px] bg-slate-900 flex items-center justify-center text-[var(--primary-fixed-dim)]">
                <FileDigit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--on-surface)] text-sm">PII Review</h2>
                <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">Document v1.0.4</p>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-2">
            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors ${activeTab === 'queue' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]'}`}
              onClick={() => setActiveTab('queue')}
            >
              <List className="w-4 h-4" />
              Attention Queue
            </button>
            <button 
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors ${activeTab === 'document' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]'}`}
              onClick={() => setActiveTab('document')}
            >
              <FileText className="w-4 h-4" />
              Full Document
            </button>
            <button onClick={() => { setNudgeMessage('Metadata view is not active in this demo.'); setNudgeVisible(true); }} className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors w-full text-left cursor-pointer">
              <List className="w-4 h-4 opacity-50" />
              Metadata
            </button>
            <button onClick={() => { setNudgeMessage('History view is not active in this demo.'); setNudgeVisible(true); }} className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors w-full text-left cursor-pointer">
              <History className="w-4 h-4 opacity-50" />
              History
            </button>
          </div>

          <div className="p-4 border-t border-[var(--outline-variant)]/40 flex flex-col gap-2">
            <button onClick={() => { setNudgeMessage('Support module is not active in this demo.'); setNudgeVisible(true); }} className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors w-full text-left cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              Support
            </button>
            <button onClick={() => { setNudgeMessage('Settings module is not active in this demo.'); setNudgeVisible(true); }} className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)] transition-colors w-full text-left cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative h-screen pt-28">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto bg-[var(--background)] p-8 relative">
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[var(--surface-container-high)] opacity-40 blur-[100px] pointer-events-none" />
            
            {fallbackOccurred && (
              <div className="max-w-4xl mx-auto mb-6 animate-in fade-in slide-in-from-top text-sm text-[var(--on-tertiary)] bg-[var(--tertiary)] px-4 py-3 rounded-[12px] flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5 opacity-90" />
                <span className="font-medium">Using SentinelIQ Offline Fallback Engine. Connection to primary AI provider failed or timed out.</span>
              </div>
            )}

            {nudgeVisible && (
              <div className="max-w-4xl mx-auto mb-6 animate-in fade-in slide-in-from-top text-sm text-[var(--on-error-container)] bg-[var(--error-container)] border border-[var(--error)]/20 px-4 py-3 rounded-[12px] flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{nudgeMessage}</span>
              </div>
            )}

            <div className="max-w-4xl mx-auto relative z-10 h-full">
              {activeTab === 'queue' ? (
                <div className="animate-in fade-in duration-500 pb-24">
                  <div className="flex items-end justify-between mb-8 border-b border-[var(--outline-variant)]/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] mb-2 font-medium">
                        <FileText className="w-4 h-4" />
                        {documentName}
                      </div>
                      <h2 className="text-3xl font-bold text-[var(--on-surface)]">Attention Queue</h2>
                      <p className="text-[var(--on-surface-variant)] mt-1">Reviewing likely misses, context anomalies, and high-priority flags detected by SentinelIQ.</p>
                    </div>
                    <div className="text-sm font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
                      Progress ({reviewedIds.size} of {detections.length})
                    </div>
                  </div>

                  {pendingDetections.length === 0 ? (
                    <div className="text-center py-24 bg-white/70 backdrop-blur-[16px] rounded-[24px] border border-[var(--outline-variant)]/50 shadow-sm">
                      <CheckCircle2 className="w-16 h-16 text-[var(--tertiary)] mx-auto mb-4 opacity-80" />
                      <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-2">Queue Empty</h3>
                      <p className="text-[var(--on-surface-variant)]">All detected items have been reviewed.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingDetections.map(d => (
                        <DetectionCard 
                          key={d.detectionId} 
                          detection={d} 
                          onReview={markReviewed}
                        />
                      ))}
                    </div>
                  )}

                  {reviewedDetections.length > 0 && (
                    <div className="mt-16">
                      <h4 className="text-sm font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-6">Reviewed Items</h4>
                      <div className="space-y-4">
                        {reviewedDetections.map(d => (
                          <DetectionCard 
                            key={d.detectionId} 
                            detection={d} 
                            isReviewed={true}
                            showAction={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in duration-500 flex gap-8 h-[calc(100vh-200px)]">
                  {/* Left Column - Metadata */}
                  <div className="w-48 shrink-0 flex flex-col gap-8 hidden md:flex">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--on-surface)] mb-4">Metadata</h3>
                      <div className="bg-white/70 backdrop-blur-md rounded-[16px] p-4 border border-[var(--outline-variant)]/40 shadow-sm text-sm space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[var(--on-surface-variant)] font-medium">File</span>
                          <span className="font-semibold">{documentName.substring(0, 15)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--on-surface-variant)] font-medium">Pages</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="flex justify-between border-t border-[var(--outline-variant)]/30 pt-2">
                          <span className="text-[var(--on-surface-variant)] font-medium">Total Detections</span>
                          <span className="font-bold">{detections.length}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-4">Processing Status</h3>
                      <div className="space-y-4 text-sm font-medium">
                        <div className="flex items-center gap-3 text-[var(--tertiary)]">
                          <CheckCircle2 className="w-5 h-5" /> OCR Complete
                        </div>
                        <div className="flex items-center gap-3 text-[var(--tertiary)]">
                          <CheckCircle2 className="w-5 h-5" /> Entity Extraction
                        </div>
                        <div className="flex items-center gap-3 text-[var(--secondary)]">
                          <div className="w-5 h-5 border-2 border-[var(--secondary)] rounded-full border-t-transparent animate-spin" /> Review Pending
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Document Viewer */}
                  <div className="flex-1 bg-white rounded-[24px] border border-[var(--outline-variant)]/40 shadow-[0_4px_20px_rgba(31,41,55,0.04)] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[var(--outline-variant)]/40 flex justify-between items-center bg-slate-50/50">
                      <span className="font-semibold text-sm text-[var(--on-surface-variant)]">Document Viewer</span>
                      <div className="flex gap-2 text-slate-400">
                        <Search className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                      </div>
                    </div>
                    <div className="p-8 overflow-auto flex-1">
                      <DocumentHighlighter />
                    </div>
                  </div>

                  {/* Right Column - Findings Summary */}
                  <div className="w-48 shrink-0 flex flex-col gap-4 hidden lg:flex">
                    <h3 className="text-sm font-bold text-[var(--on-surface)] mb-2">Findings Summary</h3>
                    
                    <div className="bg-white/70 backdrop-blur-md rounded-[16px] p-4 border-l-4 border-amber-400 border-y border-r border-y-[var(--outline-variant)]/40 border-r-[var(--outline-variant)]/40 shadow-sm">
                      <div className="flex justify-between items-end mb-4">
                        <div className="text-xs font-bold text-amber-700 uppercase tracking-wide leading-tight">High<br/>Priority</div>
                        <div className="text-xl font-black">{detections.filter(d => d.priorityTier === 'HIGH').length} <span className="text-xs font-medium text-slate-500">items</span></div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md rounded-[16px] p-4 border-l-4 border-blue-400 border-y border-r border-y-[var(--outline-variant)]/40 border-r-[var(--outline-variant)]/40 shadow-sm">
                      <div className="flex justify-between items-end mb-4">
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wide leading-tight">Standard<br/>Priority</div>
                        <div className="text-xl font-black">{detections.filter(d => d.priorityTier === 'STANDARD').length} <span className="text-xs font-medium text-slate-500">items</span></div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-md rounded-[16px] p-4 border-l-4 border-emerald-400 border-y border-r border-y-[var(--outline-variant)]/40 border-r-[var(--outline-variant)]/40 shadow-sm">
                      <div className="flex justify-between items-end mb-4">
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide leading-tight">Low<br/>Priority</div>
                        <div className="text-xl font-black">{detections.filter(d => d.priorityTier === 'LOW').length} <span className="text-xs font-medium text-slate-500">items</span></div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[var(--outline-variant)]/40 px-10 py-4 flex justify-between items-center z-20">
            <div className="text-sm text-[var(--on-surface-variant)] font-medium">
              <span className="text-[var(--on-surface)] font-bold">{reviewedIds.size} items reviewed.</span> {detections.length - reviewedIds.size} remaining in Full Document.
            </div>
            <Button 
              onClick={handleBulkApprove} 
              className="rounded-[20px] px-8 py-5 text-base bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              Approve All Reviewed
            </Button>
          </div>
        </main>
    </div>
  );
}

function DocumentHighlighter() {
  const { documentText, detections, reviewedIds, markReviewed } = useStore();

  const segments = [];
  let lastIndex = 0;
  
  const sorted = [...detections].sort((a, b) => (a.start || 0) - (b.start || 0));

  for (const det of sorted) {
    if (det.start === undefined || det.end === undefined) continue;
    
    if (det.start > lastIndex) {
      segments.push({ text: documentText.substring(lastIndex, det.start), isHighlight: false });
    }
    
    segments.push({ 
      text: documentText.substring(det.start, det.end), 
      isHighlight: true, 
      detection: det 
    });
    
    lastIndex = det.end;
  }
  
  if (lastIndex < documentText.length) {
    segments.push({ text: documentText.substring(lastIndex), isHighlight: false });
  }

  return (
    <div className="font-sans text-base leading-[1.8] whitespace-pre-wrap text-[var(--on-surface-variant)]">
      {segments.map((seg, i) => {
        if (!seg.isHighlight || !seg.detection) {
          return <span key={i}>{seg.text}</span>;
        }

        const det = seg.detection;
        const isReviewed = reviewedIds.has(det.detectionId);
        
        let colorClass = "bg-[var(--surface-container)] border-b-2 border-slate-400";
        if (det.priorityTier === 'HIGH') colorClass = "bg-[var(--priority-high-bg)] border-b-2 border-[var(--priority-high-border)] text-[var(--priority-high-text)]";
        if (det.priorityTier === 'STANDARD') colorClass = "bg-[var(--priority-standard-bg)] border-b-2 border-[var(--priority-standard-border)] text-[var(--priority-standard-text)]";
        if (det.priorityTier === 'LOW') colorClass = "bg-[var(--priority-low-bg)] border-b-2 border-[var(--priority-low-border)] text-[var(--priority-low-text)]";
        
        if (isReviewed) colorClass = "bg-transparent border-b-2 border-[var(--outline-variant)] text-[var(--outline)]";

        return (
          <Popover key={i}>
            <PopoverTrigger
              className={`cursor-pointer transition-colors ${colorClass} hover:opacity-80 font-medium px-1 rounded-t-sm`}
              render={<span />}
              nativeButton={false}
            >
              {seg.text}
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 border-[var(--outline-variant)]/50 shadow-[0_12px_40px_rgba(31,41,55,0.08)] rounded-[16px] overflow-hidden" align="start">
              <DetectionCard 
                detection={det}
                isReviewed={isReviewed}
                onReview={markReviewed}
                showAction={true}
              />
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

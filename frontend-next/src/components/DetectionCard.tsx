import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, MoreHorizontal } from "lucide-react";
import type { Detection } from "@/lib/store";

interface DetectionCardProps {
  detection: Detection;
  isReviewed?: boolean;
  onReview?: (id: string) => void;
  showAction?: boolean;
}

export function DetectionCard({ detection, isReviewed = false, onReview, showAction = true }: DetectionCardProps) {
  // Lumina Colors based on Priority
  const tierStyles = {
    HIGH: {
      cardBg: "bg-gradient-to-br from-[var(--error)]/10 to-transparent",
      badgeBg: "bg-[var(--error-container)]",
      badgeText: "text-[var(--on-error-container)]",
      textHighlight: "text-[var(--error)] underline",
      scoreText: "text-[var(--error)]",
    },
    STANDARD: {
      cardBg: "bg-gradient-to-br from-[var(--primary)]/10 to-transparent",
      badgeBg: "bg-[var(--primary-container)]/10",
      badgeText: "text-[var(--primary)]",
      textHighlight: "text-[var(--primary)] underline",
      scoreText: "text-[var(--primary)]",
    },
    LOW: {
      cardBg: "bg-gradient-to-br from-[var(--tertiary)]/10 to-transparent",
      badgeBg: "bg-[var(--tertiary-fixed)]",
      badgeText: "text-[var(--on-tertiary-fixed)]",
      textHighlight: "text-[var(--tertiary)] underline",
      scoreText: "text-[var(--tertiary)]",
    },
  };

  const style = tierStyles[detection.priorityTier] || tierStyles.STANDARD;
  const [outcome, setOutcome] = useState<'approved' | 'dismissed' | null>(null);

  const handleAction = (action: 'approved' | 'dismissed') => {
    setOutcome(action);
    onReview?.(detection.detectionId);
  };

  return (
    <div className="flex items-stretch gap-4 w-full">
      <div className={`flex-1 relative overflow-hidden ${style.cardBg} bg-white/20 backdrop-blur-[24px] rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] border border-white/40 transition-all duration-500 ${isReviewed ? 'opacity-60 grayscale-[50%] scale-[0.98]' : 'opacity-100 hover:shadow-[0_16px_48px_rgba(31,41,55,0.12)] hover:border-white/60 hover:bg-white/30'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${style.badgeBg} ${style.badgeText}`}>
              {detection.priorityTier}
            </span>
            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wide border ${detection.source === 'verification' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {detection.source === 'verification' ? 'Not redacted — flag found this' : 'Currently redacted — verify'}
            </span>
            <span className="text-sm font-medium text-[var(--on-surface-variant)]">{detection.detectionId}</span>
            <span className="text-sm text-[var(--on-surface)]">{detection.type}</span>
          </div>
          <button className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="text-[var(--on-surface-variant)] text-sm leading-relaxed mb-6">
          <p>
            ...detected context around <span className={`font-semibold ${style.textHighlight}`}>{detection.text}</span> within the document...
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-[var(--outline-variant)]/30">
          <div>
            <h4 className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Why Flagged</h4>
            <ul className="space-y-1">
              {detection.reasons && detection.reasons.length > 0 ? (
                detection.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[var(--on-surface-variant)] flex items-start gap-2">
                    <span className="text-[var(--outline)] mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-[var(--on-surface-variant)]">Pattern match</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">Why Prioritized</h4>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Signal: {detection.drivingSignal || 'Heuristic Scoring'}. Requires verification based on Lumina priority rubrics.
            </p>
          </div>
        </div>

        {showAction && (
          <div className="mt-6 pt-4 border-t border-[var(--outline-variant)]/30 flex justify-end">
            {!isReviewed ? (
              <div className="flex items-center gap-3">
                {detection.source === 'verification' ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleAction('dismissed')}
                      className="rounded-[20px] px-6 text-[var(--on-surface-variant)] border-[var(--outline)]"
                    >
                      Ignore
                    </Button>
                    <Button 
                      onClick={() => handleAction('approved')}
                      className="rounded-[20px] px-6 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      Confirm Gap Redaction
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleAction('dismissed')}
                      className="rounded-[20px] px-6 text-[var(--on-surface-variant)] border-[var(--outline)]"
                    >
                      Dismiss (Reveal)
                    </Button>
                    <Button 
                      onClick={() => handleAction('approved')}
                      className="rounded-[20px] px-6 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      Approve AI Flag
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[var(--tertiary)] font-medium px-4 py-2">
                <CheckCircle2 className="w-5 h-5" />
                {outcome === 'dismissed' 
                  ? "Reveal confirmed — this stays visible" 
                  : outcome === 'approved' 
                    ? "Redaction added — this is now hidden" 
                    : "Reviewed (Bulk)"}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      
      {detection.confidence !== undefined && (
        <div className={`w-28 shrink-0 relative overflow-hidden ${style.cardBg} bg-white/20 backdrop-blur-[24px] rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] border border-white/40 transition-all duration-500 flex flex-col items-center justify-center p-4 ${isReviewed ? 'opacity-60 grayscale-[50%] scale-[0.98]' : 'opacity-100 hover:shadow-[0_16px_48px_rgba(31,41,55,0.12)] hover:border-white/60 hover:bg-white/30'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className={`text-4xl font-black ${style.scoreText} mb-2 drop-shadow-sm`}>
              {(detection.confidence * 100).toFixed(0)}<span className="text-xl">%</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest leading-tight">
              Confidence<br/>Score
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

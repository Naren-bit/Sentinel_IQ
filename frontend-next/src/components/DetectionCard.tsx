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
      border: "border-l-[var(--error)]",
      badgeBg: "bg-[var(--error-container)]",
      badgeText: "text-[var(--on-error-container)]",
      textHighlight: "text-[var(--primary)] underline",
    },
    STANDARD: {
      border: "border-l-[var(--primary)]",
      badgeBg: "bg-[var(--primary-container)]/10",
      badgeText: "text-[var(--primary)]",
      textHighlight: "text-[var(--primary)] underline",
    },
    LOW: {
      border: "border-l-[var(--tertiary)]",
      badgeBg: "bg-[var(--tertiary-fixed)]",
      badgeText: "text-[var(--on-tertiary-fixed)]",
      textHighlight: "text-[var(--tertiary)] underline",
    },
  };

  const style = tierStyles[detection.priorityTier] || tierStyles.STANDARD;

  return (
    <div className={`relative bg-white/80 backdrop-blur-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(31,41,55,0.04)] border-y border-r border-y-[var(--outline-variant)]/40 border-r-[var(--outline-variant)]/40 border-l-4 ${style.border} transition-all duration-300 ${isReviewed ? 'opacity-60 grayscale-[50%] scale-[0.98]' : 'opacity-100 hover:shadow-[0_12px_40px_rgba(31,41,55,0.08)]'}`}>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${style.badgeBg} ${style.badgeText}`}>
              {detection.priorityTier}
            </span>
            <span className="text-sm font-medium text-[var(--on-surface-variant)]">{detection.detectionId}</span>
            <span className="text-sm text-[var(--on-surface)]">{detection.type}</span>
            {detection.confidence !== undefined && (
              <span className="text-[12px] font-medium text-[var(--outline)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--outline)]/50"></span>
                {(detection.confidence * 100).toFixed(0)}% Confidence
              </span>
            )}
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
              <Button 
                onClick={() => onReview?.(detection.detectionId)}
                className="rounded-[20px] px-6 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Approve
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-[var(--tertiary)] font-medium px-4 py-2">
                <CheckCircle2 className="w-5 h-5" />
                Reviewed
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

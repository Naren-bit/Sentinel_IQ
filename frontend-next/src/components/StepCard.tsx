import { LucideIcon } from "lucide-react";

interface StepCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  delayClass?: string;
}

export function StepCard({ title, description, icon: Icon, colorClass, delayClass = "" }: StepCardProps) {
  // Extract border color and bg color from colorClass
  // e.g. "text-[var(--primary)] bg-[var(--surface-container)] border-[var(--primary)]"
  
  return (
    <div className={`relative overflow-hidden bg-white/70 backdrop-blur-[16px] rounded-[16px] shadow-[0_12px_40px_rgba(31,41,55,0.06)] hover:shadow-[0_24px_60px_rgba(31,41,55,0.12)] transition-all duration-300 border-l-[4px] border-y border-r border-y-white border-r-white group p-[32px] animate-float ${delayClass} ${colorClass.match(/border-\[.*?\]/)?.[0] || ''}`}>
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colorClass.match(/text-\[.*?\]/)?.[0] || ''} ${colorClass.match(/bg-\[.*?\]/)?.[0] || ''}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-semibold text-[var(--on-surface)] mb-3">{title}</h3>
        <p className="text-[var(--on-surface-variant)] leading-[1.6] text-base">{description}</p>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface StepCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  delayClass?: string;
}

export function StepCard({ title, description, icon: Icon, colorClass, delayClass = "" }: StepCardProps) {
  const iconText = colorClass.match(/text-\[.*?\]/)?.[0] || '';
  const iconBg = colorClass.match(/bg-\[.*?\]/)?.[0] || 'bg-white/50';

  return (
    <div className={`relative overflow-hidden bg-white/30 backdrop-blur-[24px] rounded-[24px] shadow-[0_8px_32px_rgba(31,41,55,0.08)] hover:shadow-[0_24px_60px_rgba(31,41,55,0.12)] border border-white/40 hover:bg-white/40 hover:border-white/60 transition-all duration-500 group p-[32px] animate-float ${delayClass}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${iconText} ${iconBg} shadow-sm border border-white/50 backdrop-blur-md`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-3">{title}</h3>
        <p className="text-[var(--on-surface-variant)] leading-[1.6] text-base">{description}</p>
      </div>
    </div>
  );
}

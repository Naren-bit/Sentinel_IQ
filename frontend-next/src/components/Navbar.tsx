'use client';

import { useState, useEffect, useRef } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function Navbar() {
  const { setScreen, reset, currentScreen } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      let currentScrollY = 0;
      
      if (e.target === document || e.target === document.documentElement) {
        currentScrollY = window.scrollY;
      } else {
        const target = e.target as HTMLElement;
        // Ignore small scrollable elements, only listen to major containers
        if (!target.clientHeight || target.scrollHeight <= target.clientHeight + 50) return;
        currentScrollY = target.scrollTop;
      }
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true } as any);
  }, []);

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[1440px] z-50 flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-[20px] border border-white/40 shadow-[0_8px_32px_rgba(31,41,55,0.08)] rounded-full transition-all duration-300 ${isVisible ? 'top-6 opacity-100' : '-top-24 opacity-0 pointer-events-none'}`}>
      <div className="flex items-center gap-2 pl-4">
        <Shield className="w-6 h-6 text-[var(--primary)] fill-[var(--primary)]" />
        <span className="text-xl font-bold text-[var(--on-surface)] tracking-tight">SentinelIQ</span>
      </div>
      <div className="hidden md:flex items-center gap-2 text-sm font-medium">
        <button 
          onClick={reset} 
          className={currentScreen === 'landing' 
            ? "bg-[var(--primary)] text-white px-6 py-2 rounded-full cursor-pointer shadow-[0_0_20px_rgba(0,88,190,0.3)]" 
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-black/5 transition-all px-4 py-2 rounded-full cursor-pointer"
          }>
          Dashboard
        </button>
        <button 
          onClick={() => setScreen('upload')} 
          className={currentScreen === 'upload' || currentScreen === 'review'
            ? "bg-[var(--primary)] text-white px-6 py-2 rounded-full cursor-pointer shadow-[0_0_20px_rgba(0,88,190,0.3)]" 
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-black/5 transition-all px-4 py-2 rounded-full cursor-pointer"
          }>
          Review Queue
        </button>
        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-black/5 transition-all px-4 py-2 rounded-full cursor-pointer">Audit Logs</button>
        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-black/5 transition-all px-4 py-2 rounded-full cursor-pointer">Settings</button>
      </div>
      {currentScreen === 'landing' ? (
        <Button 
          className="rounded-[20px] px-6 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm transition-transform hover:-translate-y-0.5"
          onClick={() => setScreen('upload')}
        >
          Get Started
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          <Button 
            className="rounded-[20px] px-6 bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white shadow-sm transition-transform hover:-translate-y-0.5"
            onClick={reset}
          >
            Go Back
          </Button>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:bg-slate-700">
            U
          </div>
        </div>
      )}
    </nav>
  );
}

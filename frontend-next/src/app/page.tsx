"use client";

import { useStore } from "@/lib/store";
import { Landing } from "@/views/Landing";
import { Upload } from "@/views/Upload";
import { ReviewView } from "@/views/ReviewView";
import { Complete } from "@/views/Complete";
import { Navbar } from "@/components/Navbar";
import { LiquidBackground } from "@/components/LiquidBackground";

export default function Home() {
  const currentScreen = useStore((state) => state.currentScreen);

  return (
    <>
      <LiquidBackground />
      <Navbar />
      {currentScreen === 'landing' && <Landing />}
      {currentScreen === 'upload' && <Upload />}
      {currentScreen === 'review' && <ReviewView />}
      {currentScreen === 'complete' && <Complete />}
    </>
  );
}

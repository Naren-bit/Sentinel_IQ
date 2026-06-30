"use client";

import { useStore } from "@/lib/store";
import { Landing } from "@/views/Landing";
import { Upload } from "@/views/Upload";
import { ReviewView } from "@/views/ReviewView";
import { Complete } from "@/views/Complete";

export default function Home() {
  const currentScreen = useStore((state) => state.currentScreen);

  return (
    <>
      {currentScreen === 'landing' && <Landing />}
      {currentScreen === 'upload' && <Upload />}
      {currentScreen === 'review' && <ReviewView />}
      {currentScreen === 'complete' && <Complete />}
    </>
  );
}

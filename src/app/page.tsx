"use client";

import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Mirror } from "@/components/sections/Mirror";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Intelligence } from "@/components/sections/Intelligence";
import { Trophy } from "@/components/sections/Trophy";
import { Offer } from "@/components/sections/Offer";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { WaveBackgroundWrapper } from "@/components/backgrounds/WaveBackgroundWrapper";
import { getHomeContent } from "@/lib/content";

export default function Home() {
  const content = getHomeContent();

  return (
    <>
      {/* Fixed Header - at root level */}
      <Header />
      
      <div className="relative font-sans antialiased text-brand-text bg-brand-background min-h-screen">
        {/* Global 3D Circular Wave Background - spans entire page */}
        <WaveBackgroundWrapper className="fixed inset-0 z-0" />
        
        {/* Content with proper z-index layering */}
        <div className="relative z-10">
          <Hero content={content.hero} />
          <Mirror content={content.mirror} />
          <HowItWorks content={content.howItWorks} />
          <Intelligence content={content.intelligence} />
          <Trophy content={content.trophy} />
          <Offer content={content.offer} />
          <FAQ content={content.faq} />
          <Footer content={content.footer} />
        </div>
      </div>
    </>
  );
}

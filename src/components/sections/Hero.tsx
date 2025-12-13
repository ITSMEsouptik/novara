"use client";

import Link from "next/link";
import { HeroContent } from "@/lib/content";

interface HeroProps {
  content: HeroContent;
}

export const Hero = ({ content }: HeroProps) => {

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 pt-24 pb-20 text-center animate-fadeInUp overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-gray-50/70 backdrop-blur-sm z-[1]"></div>

      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gray-200/20 rounded-full blur-3xl animate-float z-[1]"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gray-300/20 rounded-full blur-3xl animate-float z-[1]" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 max-w-[900px] w-full">
        <h1 
          className="text-4xl md:text-[64px] font-bold leading-[1.2] text-brand-text mb-6 max-w-[900px] mx-auto"
        >
          {content.headline} <span className="highlight">{content.headlineHighlight}</span>.<br />
          <span className="block mt-2">{content.headlineSecondary}</span>
        </h1>
        
        <p 
          className="text-base md:text-xl text-brand-textSecondary max-w-[600px] mx-auto mb-10 leading-relaxed"
        >
          {content.subheadline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-[600px] w-full mx-auto mb-8">
          <div className="flex-1 relative">
            <input 
              type="url" 
              placeholder={content.inputPlaceholder}
              className="w-full px-6 py-4 glass-strong rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all placeholder:text-gray-400 shadow-lg hover:shadow-xl hover:border-gray-300"
            />
          </div>
          <Link 
            href="/create"
            className="px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover active:bg-brand-primaryActive text-white font-semibold rounded-xl whitespace-nowrap transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl text-center transform hover:-translate-y-0.5"
          >
            {content.ctaButtonText}
          </Link>
        </div>
        
        <div className="flex justify-center">
          <button className="px-6 py-3 glass rounded-xl text-brand-text border border-gray-300 font-semibold hover:bg-white/90 hover:border-gray-400 transition-all hover:scale-[1.02] shadow-md hover:shadow-lg">
            {content.secondaryButtonText}
          </button>
        </div>
      </div>
    </section>
  );
};

"use client";

import { useRef, useEffect } from "react";
import { CheckIcon, ShieldIcon } from "../icons";
import { TrophyContent, MediaItem } from "@/lib/content";

interface TrophyProps {
  content: TrophyContent;
}

export const Trophy = ({ content }: TrophyProps) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Force play videos when they become visible
  useEffect(() => {
    const playVideos = () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.play().catch(() => {
            // Autoplay failed, will try again on user interaction
          });
        }
      });
    };

    // Play immediately
    playVideos();

    // Also try on user interaction (for browsers that block autoplay)
    const handleInteraction = () => {
      playVideos();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  let videoIndex = 0;

  const MediaItemComponent = ({ item }: { item: MediaItem }) => {
    const currentVideoIndex = item.type === "video" ? videoIndex++ : -1;
    
    return (
      <div className="flex-shrink-0 w-[200px] h-[140px] md:w-[240px] md:h-[160px] rounded-xl overflow-hidden shadow-lg group relative bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20 border-2 border-transparent hover:border-gray-300/50">
        {item.type === "video" ? (
          <video
            ref={(el) => {
              if (currentVideoIndex >= 0) {
                videoRefs.current[currentVideoIndex] = el;
              }
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          >
            <source src={item.url} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="eager"
          />
        )}
        {/* Enhanced badge */}
        <div className="absolute top-2 right-2 glass-strong text-brand-text px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border border-gray-200/50 shadow-md">
          {item.type === "video" ? "🎥" : "📷"}
        </div>
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-all duration-300 pointer-events-none"></div>
      </div>
    );
  };

  const ScrollingRow = ({ items, direction = 'left' }: { items: MediaItem[]; direction?: 'left' | 'right' }) => {
    // Triple items for seamless infinite scroll
    const tripleItems = [...items, ...items, ...items];
    
    return (
      <div className="overflow-hidden flex-1 flex items-center">
        <div 
          className={`flex gap-3 ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}
          style={{ width: 'max-content' }}
        >
          {tripleItems.map((item, index) => (
            <MediaItemComponent key={`${direction}-${index}`} item={item} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
      
      <div className="relative max-w-[1200px] mx-auto z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-brand-text">{content.title}</h2>
          <p className="text-lg text-brand-textSecondary max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Gallery Side */}
          <div className="h-[400px] md:h-[520px] rounded-2xl shadow-xl relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 flex flex-col gap-3 border border-gray-200/50">
            <ScrollingRow items={content.galleryRow1} direction="left" />
            <ScrollingRow items={content.galleryRow2} direction="right" />
            <ScrollingRow items={content.galleryRow3} direction="left" />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none"></div>
          </div>
          {/* List Side */}
          <div className="space-y-6">
            <div className="space-y-5">
              {content.videoTypes.map((item, idx) => (
                <div key={idx} className="group flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition-all duration-300">
                  <div className="text-brand-success mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-text group-hover:text-gray-700 transition-colors">{item.title}</h3>
                    <p className="text-sm text-brand-textSecondary">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-strong border border-gray-200/50 rounded-xl p-6 flex gap-4 mt-8 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="text-brand-text flex-shrink-0">
                <ShieldIcon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-brand-primary font-bold mb-1 group-hover:text-gray-700 transition-colors">{content.guarantee.title}</h4>
                <p className="text-sm text-brand-textSecondary leading-relaxed">
                  {content.guarantee.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

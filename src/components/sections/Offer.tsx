import Link from "next/link";
import { OfferContent } from "@/lib/content";

interface OfferProps {
  content: OfferContent;
}

export const Offer = ({ content }: OfferProps) => {
  return (
    <section id="offer" className="relative py-20 px-6 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-gray-50/40 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      
      <div className="relative max-w-[1200px] mx-auto text-center z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-brand-text">{content.title}</h2>
        
        {/* Premium Pricing Card */}
        <div className="relative glass-strong rounded-3xl shadow-2xl p-10 max-w-[550px] mx-auto animate-slideUp hover:shadow-gray-500/20 transition-all duration-300 hover:scale-[1.02]">
          {/* Subtle background overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gray-900/2 pointer-events-none"></div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gray-200/10 to-transparent rounded-tl-3xl rounded-br-full"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-200/10 to-transparent rounded-br-3xl rounded-tl-full"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2 text-brand-text">
              {content.packageName}
            </h3>
            <p className="text-brand-textSecondary italic mb-8">{content.packageSubtitle}</p>
            
            {/* Price Display */}
            <div className="mb-10 relative">
              <div className="relative">
                <span className="text-[80px] font-bold text-brand-text leading-none block">
                  {content.price}
                </span>
                <span className="text-sm text-brand-textSecondary mt-2 block">{content.priceNote}</span>
              </div>
            </div>
            
            {/* Features List */}
            <div className="flex flex-col gap-4 text-left mb-10 pl-2">
              {content.features.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="mt-1 w-6 h-6 rounded-full bg-brand-success flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <span className="text-base text-brand-text group-hover:text-gray-700 transition-colors">{item}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Link 
              href="/create"
              className="relative w-full py-5 bg-brand-primary hover:bg-brand-primaryHover active:bg-brand-primaryActive text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl block text-center overflow-hidden group"
            >
              <span className="relative z-10">{content.ctaButtonText}</span>
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

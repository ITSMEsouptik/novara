import Link from "next/link";
import { HeroContent } from "@/lib/content";

interface HeroProps {
  content: HeroContent;
  /** Optional Tina field path for visual editing */
  tinaField?: (field: string) => string;
}

export const Hero = ({ content, tinaField }: HeroProps) => {
  // Helper function that returns data-tina-field if tinaField is provided
  const getFieldAttr = (field: string) => 
    tinaField ? { "data-tina-field": tinaField(field) } : {};

  return (
    <section className="min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 bg-gradient-to-br from-gray-50 to-brand-background text-center animate-fadeInUp">
      <h1 
        className="text-4xl md:text-[64px] font-bold leading-[1.2] text-brand-text mb-6 max-w-[900px]"
        {...getFieldAttr("hero.headline")}
      >
        {content.headline} <span className="highlight" {...getFieldAttr("hero.headlineHighlight")}>{content.headlineHighlight}</span>.<br />
        <span className="block mt-2" {...getFieldAttr("hero.headlineSecondary")}>{content.headlineSecondary}</span>
      </h1>
      
      <p 
        className="text-base md:text-xl text-brand-textSecondary max-w-[600px] mx-auto mb-10 leading-relaxed"
        {...getFieldAttr("hero.subheadline")}
      >
        {content.subheadline}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-[550px] w-full mb-8">
        <input 
          type="url" 
          placeholder={content.inputPlaceholder}
          className="flex-1 px-5 py-3.5 border border-brand-borderSecondary rounded-lg bg-white text-base focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-gray-400"
        />
        <Link 
          href="/create"
          className="px-7 py-3.5 bg-brand-primary hover:bg-brand-primaryHover active:bg-brand-primaryActive text-white font-semibold rounded-lg whitespace-nowrap transition-transform hover:scale-[1.02] shadow-sm text-center"
        >
          {content.ctaButtonText}
        </Link>
      </div>
      
      <div className="flex justify-center">
         <button className="px-6 py-3 bg-transparent text-brand-primary border border-brand-primary font-semibold rounded-lg hover:bg-brand-primary/5 transition-colors">
            {content.secondaryButtonText}
         </button>
      </div>
    </section>
  );
};

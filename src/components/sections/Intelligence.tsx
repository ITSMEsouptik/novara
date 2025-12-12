import { SearchIcon, TargetIcon, BrainIcon } from "../icons";
import { IntelligenceContent } from "@/lib/content";

interface IntelligenceProps {
  content: IntelligenceContent;
}

const iconMap = {
  search: <SearchIcon className="w-10 h-10 text-brand-text" />,
  target: <TargetIcon className="w-10 h-10 text-brand-text" />,
  brain: <BrainIcon className="w-10 h-10 text-brand-text" />,
};

export const Intelligence = ({ content }: IntelligenceProps) => {
  return (
    <section id="intelligence" className="relative py-20 px-6 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-gray-50/40 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      
      <div className="relative max-w-[1200px] mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-text mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-brand-textSecondary italic max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.pillars.map((pillar, idx) => (
            <div 
              key={idx} 
              className="group relative glass rounded-2xl p-8 flex flex-col text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-500/20 min-h-[320px]"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Subtle overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gray-900/0 group-hover:bg-gray-900/2 transition-all duration-300 pointer-events-none"></div>
              
              {/* Icon container */}
              <div className="relative mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-brand-bg2 group-hover:bg-gray-200 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110 border border-brand-border group-hover:border-gray-400">
                  <div className="text-brand-text group-hover:text-gray-700 group-hover:scale-110 transition-all duration-300">
                    {iconMap[pillar.iconName]}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-4 text-brand-text group-hover:text-gray-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-brand-textSecondary flex-grow leading-relaxed text-base">{pillar.text}</p>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/0 group-hover:bg-gray-300/50 transition-all duration-300 rounded-b-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

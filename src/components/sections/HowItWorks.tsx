import { EyeIcon, LightningIcon, BoxIcon } from "../icons";
import { HowItWorksContent } from "@/lib/content";

interface HowItWorksProps {
  content: HowItWorksContent;
}

const iconMap = {
  eye: <EyeIcon className="w-8 h-8 text-brand-text" />,
  lightning: <LightningIcon className="w-8 h-8 text-brand-text" />,
  box: <BoxIcon className="w-8 h-8 text-brand-text" />,
};

export const HowItWorks = ({ content }: HowItWorksProps) => {
  return (
    <section id="how-it-works" className="relative py-20 px-6 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.02),transparent_50%)] z-[1]"></div>
      
      <div className="relative max-w-[700px] mx-auto z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-brand-text">
          {content.title}
        </h2>
        <div className="space-y-12">
          {content.steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 relative group">
              {idx !== content.steps.length - 1 && (
                <div className="absolute left-[30px] top-20 bottom-[-48px] w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent hidden md:block opacity-30 group-hover:opacity-60 transition-opacity"></div>
              )}
              
              {/* Enhanced icon container */}
              <div className="relative flex-shrink-0">
                <div className="w-[70px] h-[70px] bg-brand-bg2 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-brand-border group-hover:border-gray-400">
                  <div className="text-brand-text group-hover:text-gray-700 group-hover:scale-110 transition-all duration-300">
                    {iconMap[step.iconName]}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold mb-3 text-brand-text group-hover:text-gray-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-brand-textSecondary text-base leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

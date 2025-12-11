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
    <section id="how-it-works" className="py-20 px-6 bg-brand-background">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-brand-text">
          {content.title}
        </h2>
        <div className="space-y-12">
          {content.steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 relative group">
              {idx !== content.steps.length - 1 && (
                  <div className="absolute left-[30px] top-20 bottom-[-30px] w-0.5 bg-brand-borderSecondary hidden md:block"></div>
              )}
              
              <div className="w-[60px] h-[60px] bg-brand-bg2 rounded-lg flex items-center justify-center flex-shrink-0">
                {iconMap[step.iconName]}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-brand-text">{step.title}</h3>
                <p className="text-brand-textSecondary text-base leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

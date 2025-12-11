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
    <section id="intelligence" className="py-20 px-6 bg-brand-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-text mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-brand-textSecondary italic">
            {content.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.pillars.map((pillar, idx) => (
            <div key={idx} className="bg-brand-surface border border-brand-border rounded-xl p-8 flex flex-col text-center transition-all hover:border-brand-primary hover:shadow-md min-h-[320px]">
              <div className="mb-4 flex justify-center">{iconMap[pillar.iconName]}</div>
              <h3 className="text-lg font-bold mb-3 text-brand-text">{pillar.title}</h3>
              <p className="text-brand-textSecondary flex-grow leading-relaxed text-base">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

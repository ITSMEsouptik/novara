import { MirrorContent } from "@/lib/content";

interface MirrorProps {
  content: MirrorContent;
}

export const Mirror = ({ content }: MirrorProps) => {
  return (
    <section className="py-20 px-6 bg-brand-surface border-t border-brand-border/50">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 text-brand-text">{content.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {content.cards.map((card, idx) => (
            <div key={idx} className="bg-brand-bg1 border border-brand-border rounded-xl p-8 transition-all hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-bold mb-3 text-brand-primary">{card.title}</h3>
              <p className="text-brand-textSecondary leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-lg italic text-brand-primary font-medium">
          {content.closingStatement}
        </p>
      </div>
    </section>
  );
};

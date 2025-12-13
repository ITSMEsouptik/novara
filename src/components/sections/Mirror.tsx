import { MirrorContent } from "@/lib/content";

interface MirrorProps {
  content: MirrorContent;
}

export const Mirror = ({ content }: MirrorProps) => {
  return (
    <section className="relative py-20 px-6 border-t border-brand-border/50 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
      
      <div className="relative max-w-[1200px] mx-auto z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-brand-text">{content.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {content.cards.map((card, idx) => (
            <div 
              key={idx} 
              className="group relative glass rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-500/10"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gray-900/0 group-hover:bg-gray-900/2 transition-all duration-300 pointer-events-none z-0"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-brand-primary group-hover:text-gray-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-brand-textSecondary leading-relaxed">{card.text}</p>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-lg italic text-brand-primary font-semibold inline-block px-6 py-3 glass rounded-xl hover:text-gray-700 transition-colors">
            {content.closingStatement}
          </p>
        </div>
      </div>
    </section>
  );
};

export const Mirror = () => {
  const cards = [
    {
      title: "The Agency Trap",
      text: "You got a quote for $1,500 just to make one video. You didn't reply because that's your rent money."
    },
    {
      title: "The DIY Nightmare",
      text: "You spent Sunday night fighting with Canva. It took 4 hours, looked amateur, and nobody liked it."
    },
    {
      title: "The Visibility Gap",
      text: "Your competitors are popping up on everyone's TikTok and Reels. You are invisible."
    }
  ];

  return (
    <section className="py-20 px-6 bg-brand-surface border-t border-brand-border/50">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 text-brand-text">Sound familiar?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-brand-bg1 border border-brand-border rounded-xl p-8 transition-all hover:-translate-y-1 hover:shadow-md">
              <h3 className="text-xl font-bold mb-3 text-brand-primary">{card.title}</h3>
              <p className="text-brand-textSecondary leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-lg italic text-brand-primary font-medium">
          It's not your fault. The game was rigged against small teams. Until now.
        </p>
      </div>
    </section>
  );
};


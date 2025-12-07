import { SearchIcon, TargetIcon, BrainIcon } from "../icons";

export const Intelligence = () => {
  const pillars = [
    {
      icon: <SearchIcon className="w-10 h-10 text-brand-text" />,
      title: "The Trend Watcher",
      text: "Our engine tracks what's working right now on TikTok and Reels. We use the audio tracks, pacing, and structures that the algorithms are currently pushing."
    },
    {
      icon: <TargetIcon className="w-10 h-10 text-brand-text" />,
      title: "The Niche Expert",
      text: "Selling coffee is different from selling plumbing. We benchmark your brand against the top 1% of competitors in your specific industry to see what offers are converting."
    },
    {
      icon: <BrainIcon className="w-10 h-10 text-brand-text" />,
      title: "The Psychological Hook",
      text: "We don't just cut clips. We structure every video with a \"Pattern Interrupt\" in the first 3 seconds to stop the scroll, followed by a psychological value anchor."
    }
  ];

  return (
    <section id="intelligence" className="py-20 px-6 bg-brand-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-text mb-4">
            We analyzed 100,000+ winning ads. <br/>
            So you don't have to.
          </h2>
          <p className="text-lg text-brand-textSecondary italic">
            Most admakers guess what "looks pretty." Novara engineers what sells.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="bg-brand-surface border border-brand-border rounded-xl p-8 flex flex-col text-center transition-all hover:border-brand-primary hover:shadow-md min-h-[320px]">
              <div className="mb-4 flex justify-center">{pillar.icon}</div>
              <h3 className="text-lg font-bold mb-3 text-brand-text">{pillar.title}</h3>
              <p className="text-brand-textSecondary flex-grow leading-relaxed text-base">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


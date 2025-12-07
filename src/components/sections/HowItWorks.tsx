import { EyeIcon, LightningIcon, BoxIcon } from "../icons";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <EyeIcon className="w-8 h-8 text-brand-text" />,
      title: "The Scan",
      text: "Our AI reads your website like a senior marketer/CMO. It learns your brand colors, best-sellers, and tone of voice instantly."
    },
    {
      icon: <LightningIcon className="w-8 h-8 text-brand-text" />,
      title: "The Strategy",
      text: "We don't just guess. Our engine analyzes top-performing ads in your niche to engineer creative strategies predicted to convert."
    },
    {
      icon: <BoxIcon className="w-8 h-8 text-brand-text" />,
      title: "The Delivery",
      text: "Minutes later, you get a folder. Vertical videos for Reels/TikTok. Banners for FB/Google. Ready to launch."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 bg-brand-background">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-brand-text">
          We don't need your footage. <br/> We need your URL.
        </h2>
        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 relative group">
              {idx !== steps.length - 1 && (
                  <div className="absolute left-[30px] top-20 bottom-[-30px] w-0.5 bg-brand-borderSecondary hidden md:block"></div>
              )}
              
              <div className="w-[60px] h-[60px] bg-brand-bg2 rounded-lg flex items-center justify-center flex-shrink-0">
                {step.icon}
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


import { CheckIcon, ShieldIcon, PhoneIcon } from "../icons";

export const Trophy = () => {
  return (
    <section className="py-20 px-6 bg-brand-background">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-brand-text">What $79 actually buys you.</h2>
            <p className="text-lg text-brand-textSecondary max-w-2xl mx-auto">
                Based on our analysis of your market, we generate the 3 specific video types your business needs to grow:
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Visual Side */}
          <div className="h-[400px] md:h-[500px] bg-gradient-to-br from-brand-bg1 to-brand-bg2 rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
            <PhoneIcon className="w-24 h-24 text-brand-primary opacity-80 mb-4" />
            <span className="text-xl md:text-2xl font-medium text-brand-textSecondary px-6 text-center">
                3 Video Variations <br/> + 10 Banners
            </span>
          </div>
          {/* List Side */}
          <div className="space-y-6">
            <div className="space-y-5">
              {[
                { title: "Video A: The Viral Hook", sub: "Maximize Views" },
                { title: "Video B: The Trust Builder", sub: "Maximize Clicks" },
                { title: "Video C: The Sales Closer", sub: "Maximize ROI" },
                { title: "The Retargeting Stack", sub: "10 Static Banners (Square & Landscape)" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="text-brand-success mt-0.5">
                    <CheckIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-text">{item.title}</h3>
                    <p className="text-sm text-brand-textSecondary">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-brand-bg3 border border-brand-primary/30 rounded-xl p-6 flex gap-4 mt-8">
               <div className="text-brand-text flex-shrink-0">
                 <ShieldIcon className="w-8 h-8" />
               </div>
               <div>
                 <h4 className="text-brand-primary font-bold mb-1">100% Brand-Safe Guarantee</h4>
                 <p className="text-sm text-brand-textSecondary leading-relaxed">
                    We match your fonts, logos, and colors perfectly. If it doesn't look like you, we fix it for free.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


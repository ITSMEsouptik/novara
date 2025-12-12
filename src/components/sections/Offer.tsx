import Link from "next/link";
import { OfferContent } from "@/lib/content";

interface OfferProps {
  content: OfferContent;
}

export const Offer = ({ content }: OfferProps) => {
  return (
    <section id="offer" className="py-20 px-6 bg-brand-surface">
      <div className="max-w-[1200px] mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-10 text-brand-text">{content.title}</h2>
        <div className="bg-white border-2 border-brand-primary rounded-2xl shadow-lg p-10 max-w-[500px] mx-auto animate-slideUp">
          <h3 className="text-2xl font-bold mb-2 text-brand-text">{content.packageName}</h3>
          <p className="text-brand-textSecondary italic mb-6">{content.packageSubtitle}</p>
          <div className="mb-8">
            <span className="text-[72px] font-bold text-brand-primary leading-none block">{content.price}</span>
            <span className="text-sm text-brand-textSecondary mt-2 block">{content.priceNote}</span>
          </div>
          <div className="flex flex-col gap-3 text-left mb-8 pl-4">
            {content.features.map((item, idx) => (
              <div key={idx} className="flex gap-3 text-brand-text">
                <span className="text-brand-success font-bold">✓</span>
                <span className="text-base">{item}</span>
              </div>
            ))}
          </div>
          <Link 
            href="/create"
            className="w-full py-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold text-lg rounded-lg transition-all hover:scale-[1.02] shadow-sm block text-center"
          >
            {content.ctaButtonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

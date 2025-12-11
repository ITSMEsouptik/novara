import { FooterContent } from "@/lib/content";

interface FooterProps {
  content: FooterContent;
}

export const Footer = ({ content }: FooterProps) => {
  return (
    <footer className="py-12 px-6 bg-brand-charcoal text-[#f5f5f5] text-center">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-sm opacity-80 mb-4">{content.copyright}</p>
        <p className="text-sm opacity-70 max-w-[600px] mx-auto mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="flex justify-center flex-wrap gap-6 text-sm">
          {content.links.map((link, idx) => (
            <a 
              key={idx}
              href={link.href} 
              className="text-brand-primary hover:opacity-80 transition-opacity"
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

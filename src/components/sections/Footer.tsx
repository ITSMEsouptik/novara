import { FooterContent } from "@/lib/content";

interface FooterProps {
  content: FooterContent;
}

export const Footer = ({ content }: FooterProps) => {
  return (
    <footer className="relative py-12 px-6 bg-gradient-to-b from-brand-charcoal via-gray-900 to-black text-[#f5f5f5] text-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.02),transparent_50%)]"></div>
      
      <div className="relative max-w-[1200px] mx-auto">
        <p className="text-sm opacity-80 mb-4">{content.copyright}</p>
        <p className="text-sm opacity-70 max-w-[600px] mx-auto mb-8 leading-relaxed">
          {content.description}
        </p>
        <div className="flex justify-center flex-wrap gap-6 text-sm">
          {content.links.map((link, idx) => (
            <a 
              key={idx}
              href={link.href} 
              className="text-gray-400 hover:text-gray-300 transition-all duration-200 relative group px-2 py-1"
            >
              {link.text}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

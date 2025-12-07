import Link from "next/link";
import { Logo } from "../Logo";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-border">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-brand-textSecondary hover:text-brand-primary transition-colors">Product</a>
          <a href="#intelligence" className="text-sm text-brand-textSecondary hover:text-brand-primary transition-colors">Intelligence</a>
          <a href="#offer" className="text-sm text-brand-textSecondary hover:text-brand-primary transition-colors">Pricing</a>
          <a href="#faq" className="text-sm text-brand-textSecondary hover:text-brand-primary transition-colors">Support</a>
          <Link href="#" className="bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};


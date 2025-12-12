"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../Logo";
import { MenuIcon, XIcon } from "../icons";

export const Header = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking on a link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "#how-it-works", label: "Product" },
    { href: "#intelligence", label: "Intelligence" },
    { href: "#offer", label: "Pricing" },
    { href: "#faq", label: "Support" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ${
        isScrolled 
          ? "glass-strong shadow-lg border-b border-gray-200/50" 
          : "glass border-b border-brand-border/50"
      }`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 100 }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-all hover:scale-105 z-50" onClick={handleLinkClick}>
          <Logo />
        </Link>
        
        {/* Desktop Navigation - Only show on landing page */}
        {isLandingPage && (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-brand-textSecondary hover:text-gray-700 transition-all duration-200 relative group px-2 py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-700 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            <Link 
              href="#" 
              className="bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2 rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg"
            >
              Login
            </Link>
          </nav>
        )}

        {/* Mobile Menu Button - Only show on landing page */}
        {isLandingPage && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-text hover:text-brand-primary transition-colors z-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        )}
      </div>

        {/* Mobile Menu Overlay - Only show on landing page */}
      {isLandingPage && (
        <div
          className={`fixed inset-0 top-[73px] md:hidden transition-all duration-300 ease-in-out z-40 ${
            isMobileMenuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }`}
        >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile Menu Panel */}
        <div
          className={`absolute top-0 left-0 right-0 glass-strong border-b border-gray-200/50 shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="flex flex-col py-6">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="px-6 py-4 text-base font-medium text-brand-text hover:text-gray-700 hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100/30 last:border-b-0 relative group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {link.label}
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>
            ))}
            <div className="px-6 pt-4 mt-2 border-t border-gray-200/50">
              <Link
                href="#"
                onClick={handleLinkClick}
                className="block w-full bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg text-center"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      </div>
      )}
    </header>
  );
};


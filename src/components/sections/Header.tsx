"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { MenuIcon, XIcon } from "../icons";

export const Header = () => {
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/98 backdrop-blur-md shadow-sm" 
          : "bg-white/95 backdrop-blur-sm"
      } border-b border-brand-border`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity z-50" onClick={handleLinkClick}>
          <Logo />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-brand-textSecondary hover:text-brand-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link 
            href="#" 
            className="bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Menu Button */}
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
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-[73px] md:hidden transition-all duration-300 ease-in-out z-40 ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile Menu Panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-white border-b border-brand-border shadow-xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="flex flex-col py-6">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="px-6 py-4 text-base font-medium text-brand-text hover:text-brand-primary hover:bg-brand-grayLight transition-all duration-200 border-b border-brand-border/50 last:border-b-0"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="px-6 pt-4 mt-2 border-t border-brand-border">
              <Link
                href="#"
                onClick={handleLinkClick}
                className="block w-full bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors text-center"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};


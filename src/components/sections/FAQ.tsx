"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../icons";
import { FAQContent } from "@/lib/content";

interface FAQProps {
  content: FAQContent;
}

export const FAQ = ({ content }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-20 px-6 overflow-hidden">
      {/* Glassmorphic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 backdrop-blur-md z-[1]"></div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)] z-[1]"></div>
      
      <div className="relative max-w-[700px] mx-auto z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-text">{content.title}</h2>
        <div className="space-y-4">
          {content.items.map((item, idx) => (
            <div 
              key={idx} 
              className={`group glass rounded-xl overflow-hidden transition-all duration-300 border border-gray-200/50 ${
                openIndex === idx 
                  ? 'shadow-xl shadow-gray-500/10 scale-[1.01]' 
                  : 'shadow-md hover:shadow-lg'
              }`}
            >
              <button 
                className="w-full p-6 flex justify-between items-center text-left hover:bg-white/50 transition-all duration-300 rounded-xl"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <h4 className={`text-lg font-bold pr-8 transition-colors ${
                  openIndex === idx 
                    ? 'text-gray-700' 
                    : 'text-brand-primary group-hover:text-gray-700'
                }`}>
                  {item.question}
                </h4>
                <div className={`transition-all duration-300 flex-shrink-0 ${
                  openIndex === idx 
                    ? 'rotate-180 text-gray-700 scale-110' 
                    : 'text-brand-textSecondary group-hover:text-gray-700'
                }`}>
                  <ChevronDownIcon />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  openIndex === idx 
                    ? 'max-h-[500px] opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`px-6 pb-6 pt-0 text-brand-textSecondary leading-relaxed transition-all duration-300 ${
                  openIndex === idx ? 'border-t border-gray-200/50 mt-2' : ''
                }`}>
                  {item.answer}
                </div>
              </div>
              
              {/* Accent line when open */}
              {openIndex === idx && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

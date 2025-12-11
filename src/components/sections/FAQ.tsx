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
    <section id="faq" className="py-20 px-6 bg-brand-background">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-text">{content.title}</h2>
        <div className="space-y-4">
          {content.items.map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-white border border-brand-border rounded-xl overflow-hidden transition-all duration-200 ${openIndex === idx ? 'shadow-sm' : ''}`}
            >
              <button 
                className="w-full p-6 flex justify-between items-center text-left hover:bg-brand-grayLight transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <h4 className="text-lg font-bold text-brand-primary pr-8">{item.question}</h4>
                <div className={`transition-transform duration-300 text-brand-textSecondary ${openIndex === idx ? 'rotate-180' : ''}`}>
                   <ChevronDownIcon />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden bg-brand-grayLight ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-brand-textSecondary leading-relaxed border-t border-transparent">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

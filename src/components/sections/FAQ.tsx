"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../icons";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      q: "Do I need to film anything?",
      a: "No. We use the images and footage already on your website or stock assets that match your brand vibe perfectly."
    },
    {
      q: "I don't know how to run ads.",
      a: "We give you the files ready to upload. We also send a simple 2-minute guide on how to launch them on Facebook/Instagram."
    },
    {
      q: "What if I don't like them?",
      a: "We offer one free round of revisions to tweak text, colors, or music. We want you to launch."
    }
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-brand-background">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-brand-text">Common Questions</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-white border border-brand-border rounded-xl overflow-hidden transition-all duration-200 ${openIndex === idx ? 'shadow-sm' : ''}`}
            >
              <button 
                className="w-full p-6 flex justify-between items-center text-left hover:bg-brand-grayLight transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <h4 className="text-lg font-bold text-brand-primary pr-8">{item.q}</h4>
                <div className={`transition-transform duration-300 text-brand-textSecondary ${openIndex === idx ? 'rotate-180' : ''}`}>
                   <ChevronDownIcon />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden bg-brand-grayLight ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-brand-textSecondary leading-relaxed border-t border-transparent">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


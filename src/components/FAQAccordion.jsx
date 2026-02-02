import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-2 md:space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="w-full px-3 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left gap-2"
          >
            <span className="font-semibold text-sm md:text-base text-gray-900 text-left leading-snug">{item.question}</span>
            <ChevronDown className={`w-4 md:w-5 h-4 md:h-5 text-gray-600 transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === index && (
            <div className="px-3 md:px-6 py-3 md:py-4 bg-gray-50 border-t border-gray-200 text-gray-700 text-xs md:text-sm leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
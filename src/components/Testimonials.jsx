import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      text: "Endlich ein Rechner der auch die Finanzierung berücksichtigt! Habe damit 3 Objekte verglichen und das Beste gefunden.",
      author: "Thomas M.",
      role: "Immobilieninvestor",
      rating: 5,
      avatar: "TM"
    },
    {
      text: "Super einfach zu bedienen. Die PDF-Analyse hat meine Bank überzeugt. Kredit wurde genehmigt!",
      author: "Sandra K.",
      role: "Erstkäuferin",
      rating: 5,
      avatar: "SK"
    },
    {
      text: "Als Steuerberater empfehle ich den Rechner meinen Mandanten. Die AfA-Berechnung ist korrekt und hilfreich.",
      author: "Dr. Michael H.",
      role: "Steuerberater",
      rating: 5,
      avatar: "MH"
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-1 md:mb-2">Das sagen unsere Nutzer</h2>
        <p className="text-center text-gray-600 text-sm md:text-base mb-6 md:mb-12">Über 10.000 Berechnungen pro Monat</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
              <div className="flex gap-1 mb-2 md:mb-3">
                {Array(t.rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-3 md:w-4 h-3 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-[10px] md:text-xs font-semibold flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs md:text-sm text-gray-900 truncate">{t.author}</div>
                  <div className="text-[10px] md:text-xs text-gray-600 truncate">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, MessageCircle, Zap } from 'lucide-react';

const FAQ_CATEGORIES = {
  zahlung: {
    title: 'Zahlungen',
    icon: '💳',
    faqs: [
      {
        q: 'Wie zahle ich meine Miete?',
        a: 'Sie können direkt in der App über Stripe oder Banküberweisung zahlen. Wählen Sie "Zahlung" im Schnellzugriff.'
      },
      {
        q: 'Welche Zahlungsmethoden werden akzeptiert?',
        a: 'Kreditkarte, Debitkarte, PayPal und Banküberweisung.'
      },
      {
        q: 'Kann ich einen Zahlungsplan erstellen?',
        a: 'Ja, kontaktieren Sie Ihren Vermieter über die Chat-Funktion für Zahlungsvereinbarungen.'
      }
    ]
  },
  reparatur: {
    title: 'Reparaturen',
    icon: '🔧',
    faqs: [
      {
        q: 'Wie melde ich einen Schaden?',
        a: 'Nutzen Sie die "Reparatur melden" Option. Beschreiben Sie das Problem und laden Sie Fotos hoch.'
      },
      {
        q: 'Wie lange dauert eine Reparatur?',
        a: 'Normalerweise werden Reparaturen innerhalb von 7 Tagen durchgeführt. Notfälle werden priorisiert.'
      },
      {
        q: 'Was ist ein Notfall?',
        a: 'Gasleck, Wasserrohrbruch, Stromausfall oder Sicherheitsrisiken sind Notfälle.'
      }
    ]
  },
  zaehler: {
    title: 'Zähler',
    icon: '⚡',
    faqs: [
      {
        q: 'Wie funktioniert die Zählerablesung?',
        a: 'Fotografieren Sie den Zähler, die App erkennt die Ziffern automatisch.'
      },
      {
        q: 'Wie oft muss ich ablesen?',
        a: 'Idealerweise monatlich am gleichen Tag für genaue Verbrauchsdaten.'
      },
      {
        q: 'Was ist der OCR?',
        a: 'OCR (Optical Character Recognition) erkennt automatisch die Zahlen auf dem Zähler.'
      }
    ]
  },
  dokumente: {
    title: 'Dokumente',
    icon: '📄',
    faqs: [
      {
        q: 'Sind meine Dokumente sicher?',
        a: 'Ja, alle Dokumente werden verschlüsselt gespeichert und nur Sie können darauf zugreifen.'
      },
      {
        q: 'Kann ich Dokumente teilen?',
        a: 'Ja, Sie können Dokumente mit Ihrem Vermieter oder Familie teilen.'
      },
      {
        q: 'Welche Dateitypen sind erlaubt?',
        a: 'PDF, Word, Excel, Bilder und Videos bis max. 50MB.'
      }
    ]
  }
};

export default function FAQSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredCategories = selectedCategory
    ? { [selectedCategory]: FAQ_CATEGORIES[selectedCategory] }
    : FAQ_CATEGORIES;

  const filteredFaqs = Object.entries(filteredCategories).reduce((acc, [key, cat]) => {
    const matchingFaqs = cat.faqs.filter(
      faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matchingFaqs.length > 0) {
      acc[key] = { ...cat, faqs: matchingFaqs };
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="FAQ durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          Alle
        </Button>
        {Object.entries(FAQ_CATEGORIES).map(([key, cat]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(key)}
            size="sm"
          >
            {cat.icon} {cat.title}
          </Button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        {Object.entries(filteredFaqs).map(([catKey, category]) => (
          <div key={catKey} className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>{category.icon}</span>
              {category.title}
            </h3>

            <div className="space-y-2">
              {category.faqs.map((faq, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    setExpandedId(expandedId === `${catKey}-${idx}` ? null : `${catKey}-${idx}`)
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-medium text-sm flex-1">{faq.q}</h4>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                          expandedId === `${catKey}-${idx}` ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {expandedId === `${catKey}-${idx}` && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-700 dark:text-gray-300">
                        {faq.a}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(filteredFaqs).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Keine Ergebnisse gefunden</p>
            <Button className="gap-2" onClick={() => {}}>
              <MessageCircle className="h-4 w-4" />
              Support kontaktieren
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
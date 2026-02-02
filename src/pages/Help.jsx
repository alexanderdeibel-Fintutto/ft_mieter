import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FAQ_DATA = [
  {
    category: 'Mängelmeldung',
    questions: [
      { q: 'Wie melde ich einen Mangel?', a: 'Gehe zu "Mängel" und tippe auf "Neuer Mangel". Beschreibe das Problem, füge Fotos hinzu und wähle die Dringlichkeit.' },
      { q: 'Wie lange dauert die Bearbeitung?', a: 'Dringende Mängel werden innerhalb von 24h bearbeitet. Normale Anfragen innerhalb von 5 Werktagen.' },
      { q: 'Kann ich den Status verfolgen?', a: 'Ja, in der Mängel-Übersicht siehst du den aktuellen Status jeder Meldung.' },
    ]
  },
  {
    category: 'Zählerablesung',
    questions: [
      { q: 'Wann muss ich die Zähler ablesen?', a: 'Die Ablesung erfolgt quartalsweise. Du erhältst eine Benachrichtigung, wenn eine Ablesung fällig ist.' },
      { q: 'Wo finde ich meine Zählernummer?', a: 'Die Zählernummer steht auf dem Zähler selbst oder in deinem Mietvertrag.' },
    ]
  },
  {
    category: 'Miete & Finanzen',
    questions: [
      { q: 'Bis wann muss die Miete bezahlt werden?', a: 'Die Miete ist bis zum 3. Werktag des Monats fällig.' },
      { q: 'Wie erhalte ich meine Nebenkostenabrechnung?', a: 'Die Abrechnung wird jährlich erstellt und dir im Dokumente-Bereich bereitgestellt.' },
    ]
  },
  {
    category: 'Allgemein',
    questions: [
      { q: 'Wie ändere ich meine Kontaktdaten?', a: 'Gehe zu Profil > Einstellungen und aktualisiere deine Daten.' },
      { q: 'An wen wende ich mich bei Notfällen?', a: 'Bei Notfällen (Wasserrohrbruch, Feuer) rufe sofort den Hausmeister oder die Notrufnummer an.' },
    ]
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600">{answer}</p>
      )}
    </div>
  );
}

function FAQCategory({ category, questions }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        {questions.map((item, i) => (
          <FAQItem key={i} question={item.q} answer={item.a} />
        ))}
      </CardContent>
    </Card>
  );
}

function ContactCard({ icon: Icon, title, value, action, color }) {
  return (
    <a href={action} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </a>
  );
}

export default function Help() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const filteredFAQ = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) || 
      q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div>
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-900">❓ Hilfe & Support</h1>
      </header>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Suche in FAQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'faq' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'contact' ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Kontakt
        </button>
      </div>

      <div className="px-4 pb-6">
        {activeTab === 'faq' ? (
          <>
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine Ergebnisse gefunden</p>
              </div>
            ) : (
              filteredFAQ.map((cat, i) => (
                <FAQCategory key={i} category={cat.category} questions={cat.questions} />
              ))
            )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Du hast eine Frage, die hier nicht beantwortet wird? Kontaktiere uns:
            </p>
            
            <div className="space-y-3">
              <ContactCard
                icon={Phone}
                title="Telefon-Hotline"
                value="+49 30 12345678"
                action="tel:+493012345678"
                color="bg-green-100 text-green-600"
              />
              <ContactCard
                icon={Mail}
                title="E-Mail Support"
                value="support@mieterapp.de"
                action="mailto:support@mieterapp.de"
                color="bg-blue-100 text-blue-600"
              />
              <ContactCard
                icon={MessageCircle}
                title="Chat"
                value="Direkt-Nachricht senden"
                action="#"
                color="bg-violet-100 text-[#8B5CF6]"
              />
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8B5CF6]" />
                  Wichtige Dokumente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#" className="block text-sm text-[#8B5CF6] hover:underline">→ Hausordnung (PDF)</a>
                <a href="#" className="block text-sm text-[#8B5CF6] hover:underline">→ Mülltrennungs-Leitfaden</a>
                <a href="#" className="block text-sm text-[#8B5CF6] hover:underline">→ Notfall-Kontakte</a>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
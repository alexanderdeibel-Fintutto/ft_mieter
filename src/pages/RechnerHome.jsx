import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Percent, Home, Calculator, Zap, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import SeatAccessGuard from '@/components/SeatAccessGuard';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import FAQAccordion from '@/components/FAQAccordion';
import SEOHead from '@/components/SEOHead';
import StructuredData from '@/components/StructuredData';
import { useSubscription } from '@/components/integrations/stripe/hooks';
import UpgradeModal from '@/components/integrations/stripe/UpgradeModal';

const CALCULATORS = [
    {
        id: 'rendite',
        name: 'Renditerechner',
        description: 'Berechne die Rendite deiner Immobilieninvestition',
        icon: TrendingUp,
        color: 'from-green-400 to-green-600',
        premium: false
    },
    {
        id: 'nebenkosten',
        name: 'Nebenkostenrechner',
        description: 'Kalkuliere Nebenkosten und erstelle Abrechnungen',
        icon: Calculator,
        color: 'from-blue-400 to-blue-600',
        premium: false
    },
    {
        id: 'mieterhoehung',
        name: 'Mieterhöhung',
        description: 'Berechne zulässige Mieterhöhungen nach Gesetz',
        icon: Percent,
        color: 'from-orange-400 to-orange-600',
        premium: true
    },
    {
        id: 'kaution',
        name: 'Kautionsrechner',
        description: 'Berechne Kaution und Rückzahlung',
        icon: Home,
        color: 'from-purple-400 to-purple-600',
        premium: false
    },
    {
        id: 'afa',
        name: 'AfA Kalkulator',
        description: 'Berechne Abschreibungen für Steuern',
        icon: Zap,
        color: 'from-red-400 to-red-600',
        premium: true
    }
];

const FAQ_ITEMS = [
  {
    question: "Was ist die Bruttomietrendite?",
    answer: "Die Bruttomietrendite berechnet sich aus der Jahresmiete geteilt durch den Kaufpreis mal 100. Sie gibt einen ersten Überblick, berücksichtigt aber keine Nebenkosten oder Finanzierung."
  },
  {
    question: "Was ist eine gute Mietrendite?",
    answer: "Eine Bruttomietrendite ab 5% gilt als gut, ab 6% als sehr gut. Bei der Nettomietrendite sind Werte ab 3,5% akzeptabel und ab 4,5% gut. Die ideale Rendite hängt von Lage, Objektzustand und persönlicher Strategie ab."
  },
  {
    question: "Was ist der Unterschied zwischen Brutto- und Nettomietrendite?",
    answer: "Die Bruttomietrendite berücksichtigt nur Kaufpreis und Mieteinnahmen. Die Nettomietrendite zieht zusätzlich alle Kosten ab: Kaufnebenkosten, Hausgeld, Instandhaltung, Mietausfallrisiko und ggf. Finanzierungskosten."
  },
  {
    question: "Was ist die Eigenkapitalrendite?",
    answer: "Die Eigenkapitalrendite zeigt, wie viel Rendite du auf dein eingesetztes Eigenkapital erzielst. Durch den Hebeleffekt bei Finanzierung kann die EK-Rendite höher sein als die Objektrendite."
  },
  {
    question: "Wie hoch sind die Kaufnebenkosten?",
    answer: "Kaufnebenkosten betragen je nach Bundesland 7-15% des Kaufpreises. Sie setzen sich zusammen aus: Grunderwerbsteuer (3,5-6,5%), Notarkosten (~1,5%), Grundbuchkosten (~0,5%) und ggf. Maklergebühren (bis 7,14%)."
  }
];

function RechnerContent() {
     const [user, setUser] = React.useState(null);
     const { tier } = useSubscription();
     const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

     React.useEffect(() => {
         const load = async () => {
             const currentUser = await base44.auth.me();
             setUser(currentUser);
         };
         load();
     }, []);

     const canAccessCalculator = (calc) => {
         if (!calc.premium) return true;
         return tier && tier !== 'free';
     };

     return (
         <div>
             <SEOHead />
             <StructuredData />
             {/* Hero Section */}
             <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 md:py-12 px-4">
                 <div className="max-w-6xl mx-auto">
                     <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2 leading-tight">FinTuttO Immobilien-Rechner</h1>
                     <p className="text-sm md:text-base lg:text-lg opacity-90">Berechne in 30 Sekunden, ob sich deine Immobilie lohnt. Professionelle Tools für deine Investitionsentscheidung.</p>
                 </div>
             </div>

             {/* Trust Badges */}
             <TrustBadges />

             {/* Main Content */}
             <div className="p-3 md:p-6 max-w-6xl mx-auto">
                 <div className="mb-6 md:mb-12">
                     <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Unsere Rechner-Tools</h2>
                     <p className="text-sm md:text-base text-gray-600">Wähle ein Tool, um deine Immobilieninvestition zu analysieren</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-12">
                     {CALCULATORS.map((calc, idx) => {
                         const Icon = calc.icon;
                         const hasAccess = canAccessCalculator(calc);
                         const isLocked = calc.premium && !hasAccess;

                         return (
                             <motion.div
                                 key={calc.id}
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: idx * 0.1 }}
                             >
                                 <Card className={`overflow-hidden h-full transition-all ${
                                     isLocked 
                                         ? 'opacity-60 border-gray-200' 
                                         : 'hover:shadow-lg transition-shadow cursor-pointer'
                                 }`}>
                                     <div className={`bg-gradient-to-r ${calc.color} h-1 md:h-2`} />
                                     <CardHeader className="p-3 md:p-6">
                                         <div className="flex items-start justify-between gap-2">
                                             <div className="flex gap-2 md:gap-3 flex-1 min-w-0">
                                                 <div className={`p-1 md:p-2 rounded-lg h-fit flex-shrink-0 ${isLocked ? 'bg-gray-100' : 'bg-gray-100'}`}>
                                                     {isLocked ? (
                                                         <Lock className="w-4 md:w-5 h-4 md:h-5 text-gray-500" />
                                                     ) : (
                                                         <Icon className="w-4 md:w-5 h-4 md:h-5 text-gray-700" />
                                                     )}
                                                 </div>
                                                 <div className="min-w-0">
                                                     <CardTitle className="text-sm md:text-lg line-clamp-2">{calc.name}</CardTitle>
                                                     <CardDescription className="mt-0.5 md:mt-1 text-xs md:text-sm">
                                                         {calc.description}
                                                     </CardDescription>
                                                 </div>
                                             </div>
                                             {calc.premium && (
                                                 <span className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${
                                                     isLocked 
                                                         ? 'bg-gray-100 text-gray-600' 
                                                         : 'bg-yellow-100 text-yellow-800'
                                                 }`}>
                                                     {isLocked ? 'Gesperrt' : 'Premium'}
                                                 </span>
                                             )}
                                         </div>
                                     </CardHeader>
                                     <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                                         <Button 
                                             onClick={() => isLocked && setShowUpgradeModal(true)}
                                             disabled={isLocked}
                                             className={`w-full text-xs md:text-sm ${isLocked ? 'cursor-not-allowed' : ''}`}
                                         >
                                             {isLocked ? 'Upgrade erforderlich' : (calc.premium ? 'Öffnen' : 'Öffnen')}
                                         </Button>
                                     </CardContent>
                                 </Card>
                             </motion.div>
                         );
                     })}
                 </div>

                 {/* Info Box */}
                 <Card className="mb-6 md:mb-12 border-blue-200 bg-blue-50">
                     <CardHeader className="flex flex-row items-start gap-2 md:gap-3 p-3 md:p-6">
                         <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                         <div className="min-w-0">
                             <CardTitle className="text-sm md:text-base">Hinweis</CardTitle>
                             <CardDescription className="mt-1 md:mt-2 text-xs md:text-sm">
                                 Diese Rechner sind Orientierungshilfen. Für wichtige finanzielle Entscheidungen konsultiere bitte einen Fachmann wie Steuerberater oder Rechtsanwalt.
                             </CardDescription>
                         </div>
                     </CardHeader>
                 </Card>
             </div>

             {/* Testimonials */}
             <Testimonials />

             {/* FAQ Section */}
             <div className="bg-gray-50 py-8 md:py-16 px-3 md:px-4">
                 <div className="max-w-6xl mx-auto">
                     <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Häufig gestellte Fragen</h2>
                     <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Alles über Mietrendite und Immobilieninvestitionen</p>
                     <FAQAccordion items={FAQ_ITEMS} />
                     </div>
                     </div>

                     <UpgradeModal 
                     isOpen={showUpgradeModal} 
                     onClose={() => setShowUpgradeModal(false)} 
                     appId="rechner"
                     highlightTier="pro"
                     />
                     </div>
                     );
                     }

export default function RechnerHome() {
    return (
        <SeatAccessGuard appId="rechner">
            <RechnerContent />
        </SeatAccessGuard>
    );
}
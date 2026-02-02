import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import FeatureSpotlight from './FeatureSpotlight';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FEATURES = [
  {
    id: 'mietrecht_chat',
    icon: '💬',
    title: 'Kostenlose Mietrechtsberatung',
    description: 'Stellen Sie Fragen zu Ihrem Mietvertrag - unsere KI hilft sofort!',
    page: 'MietrechtChat',
    requiredInterests: ['chat'],
  },
  {
    id: 'community',
    icon: '👥',
    title: 'Nachbarschafts-Community',
    description: 'Lernen Sie Ihre Nachbarn kennen und tauschen Sie sich aus',
    page: 'MieterCommunity',
    requiredInterests: ['community'],
  },
  {
    id: 'packages',
    icon: '📦',
    title: 'Paket-Benachrichtigungen',
    description: 'Lassen Sie sich benachrichtigen, wenn ein Paket für Sie ankommt',
    page: 'MieterPackages',
    requiredInterests: ['community'],
  },
  {
    id: 'repairs',
    icon: '🔧',
    title: 'Mängel melden',
    description: 'Reparaturen schnell und einfach melden - mit Fotos',
    page: 'MieterRepairs',
    requiredInterests: ['repairs'],
  },
  {
    id: 'finances',
    icon: '💰',
    title: 'Finanzen im Überblick',
    description: 'Alle Zahlungen, Nebenkostenabrechnung und mehr',
    page: 'MieterFinances',
    requiredInterests: ['finances'],
  },
  {
    id: 'letterxpress',
    icon: '✉️',
    title: 'Briefe versenden',
    description: 'Rechtssichere Briefe per Einschreiben verschicken',
    page: 'LetterXpress',
    requiredInterests: ['documents'],
  },
];

export default function FeatureDiscovery() {
  const [currentFeature, setCurrentFeature] = useState(null);
  const [discoveredFeatures, setDiscoveredFeatures] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const user = await base44.auth.me();
      const discovered = JSON.parse(localStorage.getItem('discovered_features') || '[]');
      const interests = JSON.parse(localStorage.getItem('user_interests') || '[]');
      
      setDiscoveredFeatures(discovered);
      setUserInterests(interests);

      // Find next feature to spotlight
      const undiscovered = FEATURES.filter(
        (f) => !discovered.includes(f.id) &&
        (f.requiredInterests.length === 0 || f.requiredInterests.some((i) => interests.includes(i)))
      );

      if (undiscovered.length > 0) {
        // Show after some activity time
        const timer = setTimeout(() => {
          setCurrentFeature(undiscovered[0]);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Feature discovery error:', error);
    }
  };

  const markAsDiscovered = (featureId) => {
    const updated = [...discoveredFeatures, featureId];
    setDiscoveredFeatures(updated);
    localStorage.setItem('discovered_features', JSON.stringify(updated));
  };

  const handleDismiss = () => {
    if (currentFeature) {
      markAsDiscovered(currentFeature.id);
    }
    setCurrentFeature(null);
  };

  const handleTryIt = () => {
    if (currentFeature) {
      markAsDiscovered(currentFeature.id);
      navigate(createPageUrl(currentFeature.page));
      setCurrentFeature(null);
    }
  };

  return (
    <FeatureSpotlight
      feature={currentFeature}
      onDismiss={handleDismiss}
      onTryIt={handleTryIt}
    />
  );
}
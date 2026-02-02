import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const PERSONA_MAPPING = {
  landlord: { free: 'vermieter_free', pro: 'vermieter_pro' },
  tenant: 'mieter',
  caretaker: 'hausmeister',
  manager: 'hausverwaltung'
};

export const useAIService = (userRole, userTier = 'free') => {
  const [context, setContext] = useState(null);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load AI context and set persona on mount
  useEffect(() => {
    const loadContext = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('loadAIContext');
        const { appContext, personas, systemPrompts } = response.data;

        setContext({
          appContext,
          personas,
          systemPrompts
        });

        // Determine and set current persona
        const personaKey = PERSONA_MAPPING[userRole];
        const selectedTier = userRole === 'landlord' && personaKey ? personaKey[userTier] : personaKey;
        const persona = personas?.find(p => p.persona_id === selectedTier);

        if (persona) {
          setCurrentPersona(persona);
        }
      } catch (error) {
        console.error('Error loading AI context:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, [userRole, userTier]);

  // Call KI Service
  const callKI = useCallback(
    async (message, conversationType = 'general') => {
      try {
        const response = await base44.functions.invoke('callKIService', {
          action: 'answer',
          message,
          conversation_type: conversationType,
          user_tier: userTier
        });

        return response.data;
      } catch (error) {
        console.error('Error calling KI service:', error);
        throw error;
      }
    },
    [userTier]
  );

  // Check for cross-sell opportunities
  const checkCrossSell = useCallback(async (message) => {
    try {
      const response = await base44.functions.invoke('checkCrossSell', {
        userMessage: message
      });

      return response.data?.recommendation || null;
    } catch (error) {
      console.error('Error checking cross-sell:', error);
      return null;
    }
  }, []);

  // Full message processing with cross-sell check
  const processMessage = useCallback(
    async (message, conversationType = 'general') => {
      try {
        // Check for cross-sell opportunity
        const crossSellRecommendation = await checkCrossSell(message);

        // Get KI response
        const kiResponse = await callKI(message, conversationType);

        // Combine response with cross-sell if available
        return {
          ...kiResponse,
          crossSell: crossSellRecommendation
        };
      } catch (error) {
        console.error('Error processing message:', error);
        throw error;
      }
    },
    [callKI, checkCrossSell]
  );

  return {
    context,
    currentPersona,
    loading,
    callKI,
    checkCrossSell,
    processMessage
  };
};
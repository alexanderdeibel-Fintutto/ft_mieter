import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'de-DE';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceCommand = (command) => {
    const commands = [
      { keywords: ['mietrecht', 'chat', 'beratung'], page: 'MietrechtChat', label: 'Mietrecht Chat' },
      { keywords: ['reparatur', 'mangel', 'defekt'], page: 'MieterRepairs', label: 'Reparaturen' },
      { keywords: ['finanzen', 'zahlung', 'miete'], page: 'MieterFinances', label: 'Finanzen' },
      { keywords: ['community', 'nachbar'], page: 'MieterCommunity', label: 'Community' },
      { keywords: ['paket', 'post'], page: 'MieterPackages', label: 'Pakete' },
      { keywords: ['dokument', 'datei'], page: 'Dokumente', label: 'Dokumente' },
      { keywords: ['start', 'home', 'anfang'], page: 'MieterHome', label: 'Startseite' },
    ];

    const matched = commands.find((cmd) =>
      cmd.keywords.some((keyword) => command.includes(keyword))
    );

    if (matched) {
      toast.success(`Öffne ${matched.label}...`);
      navigate(createPageUrl(matched.page));
    } else {
      toast.error('Befehl nicht erkannt. Versuchen Sie: "Öffne Mietrecht Chat"');
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Sprachsteuerung wird in Ihrem Browser nicht unterstützt');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast.info('Sprechen Sie jetzt... z.B. "Öffne Mietrecht Chat"');
    }
  };

  if (!recognition) return null;

  return (
    <Button
      variant={isListening ? 'default' : 'outline'}
      size="icon"
      onClick={toggleListening}
      className={`rounded-full ${isListening ? 'animate-pulse bg-red-600' : ''}`}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
}
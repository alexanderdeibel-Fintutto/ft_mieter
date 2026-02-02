import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VoiceInput({
  onTranscript,
  placeholder = 'Sagen Sie etwas...',
  language = 'de-DE',
  onError,
  continuous = false,
  interimResults = true
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.language = language;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcriptSegment + ' ';
        } else {
          interim += transcriptSegment;
        }
      }

      setInterimTranscript(interim);
      setTranscript(prev => prev + final);
      onTranscript?.(transcript + final);
    };

    recognition.onerror = (event) => {
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return (
    <div className="space-y-3">
      {/* Transcript Display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-400 italic ml-2">{interimTranscript}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={cn(
            'flex-1 h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/50'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
        >
          {isListening ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Loader className="w-5 h-5" />
              </motion.div>
              Abhören...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Starten
            </>
          )}
        </motion.button>

        {transcript && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="px-4"
          >
            Löschen
          </Button>
        )}
      </div>

      {/* Voice Indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ['20px', '40px', '20px'] }}
              transition={{ duration: 0.4, delay: i * 0.1, repeat: Infinity }}
              className="w-1 bg-blue-600 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Voice Button (Compact)
export function VoiceButton({ onTranscript, size = 'md' }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.language = 'de-DE';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final) onTranscript?.(final);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggle = () => {
    if (recognitionRef.current) {
      isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        sizeClasses[size],
        isListening
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      )}
    >
      {isListening ? (
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
          <Mic className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
        </motion.div>
      ) : (
        <MicOff className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
      )}
    </motion.button>
  );
}
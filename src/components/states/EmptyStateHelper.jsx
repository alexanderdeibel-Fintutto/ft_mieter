import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function EmptyStateHelper({ icon: Icon, title, description, actionLabel, onAction, tips = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>

          {tips.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Tipps zum Einstieg:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onAction && (
            <Button onClick={onAction} className="w-full" size="lg">
              {actionLabel} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
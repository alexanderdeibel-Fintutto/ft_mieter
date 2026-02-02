import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud } from 'lucide-react';

export default function WelcomeGreeting({ user }) {
  const hour = new Date().getHours();
  
  const getGreeting = () => {
    if (hour < 12) return { text: 'Guten Morgen', icon: Sun, color: 'text-yellow-500' };
    if (hour < 18) return { text: 'Guten Tag', icon: Sun, color: 'text-orange-500' };
    return { text: 'Guten Abend', icon: Moon, color: 'text-blue-500' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <GreetingIcon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting.text}, {user?.full_name?.split(' ')[0] || 'Willkommen'}! 👋
          </h1>
          <p className="text-gray-600">Was möchten Sie heute erledigen?</p>
        </div>
      </div>
    </motion.div>
  );
}
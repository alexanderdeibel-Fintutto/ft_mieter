import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MessageSquare, Users, Settings, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import SmartNavigationSystem from './SmartNavigationSystem';
import useAuth from '../useAuth';

export default function SmartBottomNav({ unreadMessages = 0, newActivity = 0 }) {
  const { user } = useAuth();
  const userRole = user?.role === 'admin' ? 'admin' : 'mieter';
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const mainNav = [
    { icon: Home, label: 'Start', page: 'MieterHome', notifications: 0 },
    { icon: MessageSquare, label: 'Chat', page: 'MietrechtChat', notifications: unreadMessages },
    { icon: Users, label: 'Community', page: 'MieterCommunity', notifications: newActivity },
    { component: 'SmartNav', label: 'Mehr', action: 'smart', notifications: 0 },
  ];

  const moreOptions = [
    { icon: '🔧', label: 'Reparaturen', page: 'MieterRepairs' },
    { icon: '💰', label: 'Finanzen', page: 'MieterFinances' },
    { icon: '📄', label: 'Dokumente', page: 'Dokumente' },
    { icon: '📦', label: 'Pakete', page: 'MieterPackages' },
    { icon: '✉️', label: 'Briefe', page: 'LetterXpress' },
    { icon: '🎁', label: 'Was ist neu?', page: 'WhatsNew' },
    { icon: '⚙️', label: 'Einstellungen', page: 'Settings' },
  ];

  const isActive = (page) => location.pathname.includes(page);

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl z-40 p-4"
            >
              <div className="grid grid-cols-3 gap-3">
                {moreOptions.map((option, idx) => (
                  <Link
                    key={idx}
                    to={createPageUrl(option.page)}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{option.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
          {mainNav.map((item, idx) => {
            const Icon = item.icon;
            const active = item.page ? isActive(item.page) : false;

            if (item.component === 'SmartNav') {
              return (
                <div key={idx} className="flex flex-col items-center justify-center flex-1 h-full">
                  <SmartNavigationSystem userRole={userRole} />
                </div>
              );
            }

            if (item.action === 'more') {
              return (
                <button
                  key={idx}
                  onClick={() => setShowMore(!showMore)}
                  className="flex flex-col items-center justify-center flex-1 h-full relative group"
                >
                  <div className={`relative ${showMore ? 'text-blue-600' : 'text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      showMore ? 'text-blue-600 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                to={createPageUrl(item.page)}
                className="flex flex-col items-center justify-center flex-1 h-full relative group"
              >
                <div className={`relative ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                  <Icon className="w-6 h-6" />
                  {item.notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                      {item.notifications > 9 ? '9+' : item.notifications}
                    </Badge>
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    active ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
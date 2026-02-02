import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { MessageSquare, Wrench, DollarSign, FileText, Users, PackageOpen, Mail, Calculator } from 'lucide-react';

export default function QuickActionButtons({ userInterests = [] }) {
  const allActions = [
    { 
      icon: MessageSquare, 
      label: 'Mietrecht Chat', 
      page: 'MietrechtChat', 
      color: 'from-green-400 to-green-600',
      interest: 'chat'
    },
    { 
      icon: Wrench, 
      label: 'Mangel melden', 
      page: 'MieterRepairs', 
      color: 'from-orange-400 to-orange-600',
      interest: 'repairs'
    },
    { 
      icon: DollarSign, 
      label: 'Zahlungen', 
      page: 'MieterFinances', 
      color: 'from-purple-400 to-purple-600',
      interest: 'finances'
    },
    { 
      icon: FileText, 
      label: 'Dokumente', 
      page: 'Dokumente', 
      color: 'from-red-400 to-red-600',
      interest: 'documents'
    },
    { 
      icon: Users, 
      label: 'Community', 
      page: 'MieterCommunity', 
      color: 'from-blue-400 to-blue-600',
      interest: 'community'
    },
    { 
      icon: PackageOpen, 
      label: 'Pakete', 
      page: 'MieterPackages', 
      color: 'from-pink-400 to-pink-600',
      interest: 'community'
    },
  ];

  // Prioritize based on user interests
  const prioritizedActions = allActions.sort((a, b) => {
    const aMatch = userInterests.includes(a.interest);
    const bMatch = userInterests.includes(b.interest);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Schnellzugriff</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {prioritizedActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.page}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={createPageUrl(action.page)}
                className="block"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${action.color} rounded-full flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{action.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wrench, DollarSign, PackageOpen, Users, TrendingUp, Calendar } from 'lucide-react';

export default function PersonalizedWidgets({ userInterests, stats }) {
  const widgets = [];

  // Add widgets based on user interests
  if (userInterests.includes('repairs')) {
    widgets.push({
      title: 'Meine Reparaturen',
      icon: Wrench,
      color: 'orange',
      value: stats.repairs,
      label: 'offen',
      page: 'MieterRepairs',
    });
  }

  if (userInterests.includes('finances')) {
    widgets.push({
      title: 'Finanzen',
      icon: DollarSign,
      color: 'purple',
      value: stats.payments,
      label: 'ausstehend',
      page: 'MieterFinances',
    });
  }

  if (userInterests.includes('community')) {
    widgets.push({
      title: 'Community',
      icon: Users,
      color: 'blue',
      value: stats.activity,
      label: 'neue Beiträge',
      page: 'MieterCommunity',
    });

    widgets.push({
      title: 'Pakete',
      icon: PackageOpen,
      color: 'pink',
      value: stats.packages,
      label: 'bereit',
      page: 'MieterPackages',
    });
  }

  // Always show at least 2 widgets
  if (widgets.length === 0) {
    widgets.push(
      {
        title: 'Mietrecht Chat',
        icon: TrendingUp,
        color: 'green',
        value: '24/7',
        label: 'verfügbar',
        page: 'MietrechtChat',
      },
      {
        title: 'Community',
        icon: Users,
        color: 'blue',
        value: stats.activity,
        label: 'neue Beiträge',
        page: 'MieterCommunity',
      }
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Ihr Überblick</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {widgets.map((widget, idx) => {
          const Icon = widget.icon;
          return (
            <Link key={idx} to={createPageUrl(widget.page)}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 bg-${widget.color}-100 rounded-full flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 text-${widget.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{widget.value}</div>
                  <p className="text-sm text-gray-600">{widget.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{widget.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
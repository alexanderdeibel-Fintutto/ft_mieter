import React from 'react';
import { Bell } from 'lucide-react';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

export default function NotificationSettings() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold">Benachrichtigungseinstellungen</h1>
          </div>
          <p className="text-gray-600">
            Verwalten Sie, wie und wann Sie Benachrichtigungen erhalten möchten.
          </p>
        </div>

        {/* Preferences */}
        <NotificationPreferences />
      </div>
    </div>
  );
}
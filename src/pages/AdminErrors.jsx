import React from 'react';
import ErrorLogDashboard from '@/components/admin/ErrorLogDashboard';

export default function AdminErrorsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Fehler-Logs</h1>
                    <p className="text-gray-600 mt-1">
                        Übersicht über alle System-Fehler
                    </p>
                </div>

                <ErrorLogDashboard />
            </div>
        </div>
    );
}
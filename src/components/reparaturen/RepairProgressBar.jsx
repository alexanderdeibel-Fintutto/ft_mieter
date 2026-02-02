import React from 'react';
import { AlertCircle, Loader2, CheckCircle2, Clock, User } from 'lucide-react';

const PROGRESS_STEPS = [
    { key: 'gemeldet', label: 'Gemeldet', icon: AlertCircle },
    { key: 'in_bearbeitung', label: 'In Bearbeitung', icon: Loader2 },
    { key: 'handwerker_beauftragt', label: 'Handwerker beauftragt', icon: User },
    { key: 'termin_vereinbart', label: 'Termin vereinbart', icon: Clock },
    { key: 'abgeschlossen', label: 'Abgeschlossen', icon: CheckCircle2 }
];

export default function RepairProgressBar({ status }) {
    const currentIndex = PROGRESS_STEPS.findIndex(step => step.key === status);
    const progressPercentage = ((currentIndex + 1) / PROGRESS_STEPS.length) * 100;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Status-Fortschritt</p>
                <p className="text-xs text-gray-500">{currentIndex + 1} / {PROGRESS_STEPS.length}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between mt-4">
                {PROGRESS_STEPS.map((step, index) => {
                    const IconComponent = step.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1 relative">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                    isCompleted
                                        ? isCurrent
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <p className={`text-xs text-center line-clamp-2 ${
                                isCurrent ? 'font-semibold text-amber-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </p>

                            {/* Connector Line */}
                            {index < PROGRESS_STEPS.length - 1 && (
                                <div className={`absolute top-4 left-1/2 w-[calc(100%-1rem)] h-0.5 ${
                                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
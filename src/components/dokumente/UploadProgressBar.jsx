import React from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function UploadProgressBar({ fileName, progress, status, error }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'uploading':
                return {
                    icon: <Loader2 className="w-5 h-5 animate-spin text-blue-600" />,
                    label: 'Wird hochgeladen...',
                    color: 'bg-blue-50',
                    textColor: 'text-blue-700'
                };
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                    label: 'Erfolgreich hochgeladen',
                    color: 'bg-green-50',
                    textColor: 'text-green-700'
                };
            case 'error':
                return {
                    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                    label: 'Upload fehlgeschlagen',
                    color: 'bg-red-50',
                    textColor: 'text-red-700'
                };
            default:
                return {
                    icon: <Upload className="w-5 h-5 text-gray-600" />,
                    label: 'Wird vorbereitet...',
                    color: 'bg-gray-50',
                    textColor: 'text-gray-700'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`rounded-lg p-4 border ${config.color}`}>
            <div className="flex items-start gap-3">
                {config.icon}
                <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${config.textColor}`}>{config.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">{fileName}</p>
                    
                    {status === 'uploading' && (
                        <div className="mt-2">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                        </div>
                    )}
                    
                    {error && (
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
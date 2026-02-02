import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle } from 'lucide-react';

const LETTER_TYPES_INFO = {
    standard: { name: 'Standard (schwarz-weiß)', color: '#000' },
    colored: { name: 'Farbig', color: '#FF6B35' },
    duplex: { name: 'Beidseitig', color: '#000' }
};

export default function LetterPreviewPanel({ formData }) {
    const letterType = LETTER_TYPES_INFO[formData.letterType];
    const hasRecipient = formData.recipientName && formData.recipientCity;
    const hasContent = formData.content?.trim().length > 0;

    return (
        <Card className="sticky top-6 bg-white shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Brief-Vorschau
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Type Badge */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Brieftyp</p>
                    <p className="font-medium text-sm">{letterType.name}</p>
                </div>

                {/* Recipient Info */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Empfänger</p>
                    {hasRecipient ? (
                        <div className="text-sm space-y-1">
                            <p className="font-medium">{formData.recipientName}</p>
                            <p className="text-gray-700">{formData.recipientStreet}</p>
                            <p className="text-gray-700">{formData.recipientPostalCode} {formData.recipientCity}</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-orange-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Empfänger erforderlich</span>
                        </div>
                    )}
                </div>

                {/* Content Preview */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Inhalt</p>
                    {hasContent ? (
                        <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">
                            {formData.content}
                        </p>
                    ) : (
                        <div className="flex items-center gap-2 text-orange-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Inhalt erforderlich</span>
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="pt-2 border-t border-gray-200">
                    {hasRecipient && hasContent ? (
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                            <span className="font-medium">Bereit zum Versenden</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                            <span>Bitte fülle alle Felder aus</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
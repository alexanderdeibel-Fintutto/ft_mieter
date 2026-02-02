import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Share2 } from 'lucide-react';
import UnifiedFormBuilder from '@/components/forms/UnifiedFormBuilder';

/**
 * Unified Calculator Component
 * Für Rendite, Nebenkosten, Mietererhöhung, etc.
 */
export default function UnifiedCalculator({ calculatorType, calculatorConfig }) {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async (formData) => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('calculateWithRecorder', {
                calculator_type: calculatorType,
                input_data: formData,
                config: calculatorConfig
            });
            setResults(response.data.results);
        } catch (error) {
            console.error('Calculation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!results) return;
        // PDF Export wird in eigenem Modul behandelt
        console.log('Download PDF with results:', results);
    };

    const handleShare = async () => {
        if (!results) return;
        // Share-Funktionalität
        const text = `Meine ${calculatorType} Berechnung: ${JSON.stringify(results, null, 2)}`;
        if (navigator.share) {
            navigator.share({
                title: calculatorType,
                text: text
            });
        }
    };

    return (
        <div className="space-y-6">
            {!results ? (
                <UnifiedFormBuilder
                    formConfig={calculatorConfig.formConfig}
                    onSubmit={handleCalculate}
                    loading={loading}
                />
            ) : (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ergebnisse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {calculatorConfig.resultRenderer(results)}
                            
                            <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={handleDownloadPDF} className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF exportieren
                                </Button>
                                <Button variant="outline" onClick={handleShare} className="flex-1">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Teilen
                                </Button>
                                <Button variant="outline" onClick={() => setResults(null)} className="flex-1">
                                    Neu berechnen
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
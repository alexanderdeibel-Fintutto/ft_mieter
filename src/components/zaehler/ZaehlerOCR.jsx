import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ZaehlerOCR({ 
    buildingId,
    unitId,
    meterId,
    previousValue,
    previousDate,
    meterType,
    appSource = 'mieterapp',
    onSuccess,
    onError
}) {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [editedValue, setEditedValue] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview erstellen
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Base64 für API
        const base64Reader = new FileReader();
        base64Reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            setImage(base64);
        };
        base64Reader.readAsDataURL(file);
    };

    const analyzeImage = async () => {
        if (!image) return;
        
        setLoading(true);
        setResult(null);

        try {
            const response = await base44.functions.invoke('analyzeZaehlerImage', {
                image_base64: image,
                meter_type: meterType,
                previous_value: previousValue,
                previous_date: previousDate,
                building_id: buildingId,
                unit_id: unitId,
                meter_id: meterId,
                app_source: appSource
            });

            setResult(response.data);
            setEditedValue(response.data.reading?.value);
            
            if (response.data.success) {
                toast.success('Zählerstand erkannt!');
                if (onSuccess) onSuccess(response.data);
            } else {
                toast.error('Zählerstand konnte nicht erkannt werden');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            toast.error('Fehler bei der Analyse');
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };

    const confirmReading = async () => {
        if (!result?.saved_reading_id) {
            toast.success('Ablesung bestätigt!');
            if (onSuccess) {
                onSuccess({
                    ...result,
                    reading: { ...result.reading, value: editedValue }
                });
            }
            return;
        }

        const wasEdited = editedValue !== result.reading?.value;
        
        try {
            await base44.functions.invoke('confirmMeterReading', {
                reading_id: result.saved_reading_id,
                confirmed_value: editedValue,
                was_manually_corrected: wasEdited
            });

            toast.success('Ablesung bestätigt!');
            
            if (onSuccess) {
                onSuccess({
                    ...result,
                    reading: { ...result.reading, value: editedValue },
                    was_manually_corrected: wasEdited
                });
            }
        } catch (error) {
            console.error('Confirm error:', error);
            toast.error('Fehler beim Bestätigen');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Zähler fotografieren</h3>
                    <p className="text-sm text-gray-500">KI erkennt den Stand automatisch</p>
                </div>
            </div>

            {/* Upload Bereich */}
            {!imagePreview && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Foto aufnehmen
                        </Button>
                        
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Bild hochladen
                        </Button>
                    </div>
                    
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    
                    <p className="mt-4 text-sm text-gray-400">
                        Tipp: Fotografiere den Zähler frontal und achte auf gute Beleuchtung
                    </p>
                </div>
            )}

            {/* Bildvorschau */}
            {imagePreview && !result && (
                <div className="space-y-4">
                    <div className="relative">
                        <img 
                            src={imagePreview} 
                            alt="Zählerfoto" 
                            className="w-full rounded-lg max-h-64 object-contain bg-gray-50"
                        />
                        <button
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <Button
                        onClick={analyzeImage}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                KI analysiert...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                Zählerstand erkennen
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Ergebnis */}
            {result && (
                <div className="space-y-6">
                    
                    {/* Erkannter Wert */}
                    <div className={`p-4 rounded-lg ${
                        result.reading?.confidence >= 0.8 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Erkannter Wert</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                                result.reading?.confidence >= 0.8 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {result.reading?.confidence_label}
                            </span>
                        </div>
                        
                        <div className="flex items-baseline gap-2">
                            <Input
                                type="number"
                                value={editedValue ?? ''}
                                onChange={(e) => setEditedValue(parseFloat(e.target.value))}
                                className="text-3xl font-bold text-gray-900 w-40"
                                step="0.01"
                            />
                            <span className="text-xl text-gray-500">{result.reading?.unit}</span>
                        </div>
                        
                        {result.reading?.meter_number && (
                            <p className="mt-2 text-sm text-gray-500">
                                Zählernummer: {result.reading.meter_number}
                            </p>
                        )}
                    </div>

                    {/* Verbrauch */}
                    {result.plausibility?.consumption !== null && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Verbrauch seit letzter Ablesung: 
                                <span className="font-semibold ml-1">
                                    {result.plausibility.consumption.toFixed(2)} {result.reading?.unit}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Warnungen */}
                    {!result.plausibility?.is_plausible && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-700">Plausibilitätsprüfung</p>
                                <p className="text-sm text-red-600">{result.plausibility?.note}</p>
                            </div>
                        </div>
                    )}

                    {/* Verbesserungsvorschläge */}
                    {result.quality?.suggestions?.length > 0 && result.reading?.confidence < 0.8 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="font-medium text-blue-700 mb-2">Tipp für bessere Erkennung:</p>
                            <ul className="text-sm text-blue-600 space-y-1">
                                {result.quality.suggestions.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Cross-Sell Banner */}
                    {result.cross_sell && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                            <p className="text-sm text-gray-700 mb-3">{result.cross_sell.message}</p>
                            <a 
                                href={result.cross_sell.action?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                                {result.cross_sell.action?.cta}
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    )}

                    {/* Aktionen */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                                setResult(null);
                            }}
                            variant="outline"
                            className="flex-1"
                        >
                            Neues Foto
                        </Button>
                        <Button
                            onClick={confirmReading}
                            className="flex-1"
                        >
                            Wert bestätigen
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
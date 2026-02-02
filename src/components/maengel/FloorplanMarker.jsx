import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from '@/components/ui/dialog';
import { MapPin, X, Check, Home, Upload, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Default simple floorplan SVG
const DEFAULT_FLOORPLAN = `data:image/svg+xml,${encodeURIComponent(`
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="380" height="280" fill="#f8f9fa" stroke="#e5e7eb" stroke-width="2"/>
  <!-- Rooms -->
  <rect x="20" y="20" width="150" height="120" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="95" y="85" text-anchor="middle" fill="#6b7280" font-size="12">Wohnzimmer</text>
  
  <rect x="180" y="20" width="100" height="120" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="230" y="85" text-anchor="middle" fill="#6b7280" font-size="12">Küche</text>
  
  <rect x="290" y="20" width="90" height="120" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="335" y="85" text-anchor="middle" fill="#6b7280" font-size="12">Bad</text>
  
  <rect x="20" y="150" width="180" height="130" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="110" y="220" text-anchor="middle" fill="#6b7280" font-size="12">Schlafzimmer</text>
  
  <rect x="210" y="150" width="170" height="130" fill="white" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="295" y="220" text-anchor="middle" fill="#6b7280" font-size="12">Flur</text>
</svg>
`)}`;

export default function FloorplanMarker({ 
    marker, 
    onMarkerChange, 
    floorplanUrl,
    compact = false 
}) {
    const [showDialog, setShowDialog] = useState(false);
    const [tempMarker, setTempMarker] = useState(marker);
    const [customFloorplan, setCustomFloorplan] = useState(floorplanUrl);
    const containerRef = useRef(null);

    const imageUrl = customFloorplan || DEFAULT_FLOORPLAN;

    const handleImageClick = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setTempMarker({ x, y });
    };

    const handleSave = () => {
        onMarkerChange(tempMarker);
        setShowDialog(false);
        toast.success('Markierung gespeichert');
    };

    const handleReset = () => {
        setTempMarker(null);
    };

    // Compact preview for form
    if (compact) {
        return (
            <div className="space-y-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(true)}
                    className="w-full justify-start"
                >
                    <MapPin className={`w-4 h-4 mr-2 ${marker ? 'text-violet-600' : 'text-gray-400'}`} />
                    {marker ? 'Position markiert ✓' : 'Auf Grundriss markieren'}
                </Button>

                {marker && (
                    <div 
                        className="relative h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setShowDialog(true)}
                    >
                        <img 
                            src={imageUrl}
                            alt="Grundriss" 
                            className="w-full h-full object-contain"
                        />
                        <div
                            className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                        >
                            <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
                        </div>
                    </div>
                )}

                <FloorplanDialog 
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    imageUrl={imageUrl}
                    tempMarker={tempMarker}
                    onImageClick={handleImageClick}
                    onSave={handleSave}
                    onReset={handleReset}
                    containerRef={containerRef}
                />
            </div>
        );
    }

    // Full view for detail page
    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-violet-600" />
                Position im Grundriss
            </h3>

            <div 
                className="relative bg-gray-50 rounded-xl overflow-hidden border"
                style={{ aspectRatio: '4/3' }}
            >
                <img 
                    src={imageUrl}
                    alt="Grundriss" 
                    className="w-full h-full object-contain"
                />
                {marker && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -translate-x-1/2 -translate-y-full"
                        style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    >
                        <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function FloorplanDialog({ 
    open, 
    onOpenChange, 
    imageUrl, 
    tempMarker, 
    onImageClick, 
    onSave, 
    onReset,
    containerRef 
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-violet-600" />
                        Position markieren
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Tippe auf den Grundriss, um die Position des Mangels zu markieren.
                    </p>

                    <div 
                        ref={containerRef}
                        className="relative bg-gray-50 rounded-xl overflow-hidden border cursor-crosshair"
                        style={{ aspectRatio: '4/3' }}
                        onClick={onImageClick}
                    >
                        <img 
                            src={imageUrl}
                            alt="Grundriss" 
                            className="w-full h-full object-contain pointer-events-none"
                        />
                        <AnimatePresence>
                            {tempMarker && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -translate-x-1/2 -translate-y-full"
                                    style={{ left: `${tempMarker.x}%`, top: `${tempMarker.y}%` }}
                                >
                                    <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    {tempMarker && (
                        <Button variant="outline" onClick={onReset}>
                            <Undo2 className="w-4 h-4 mr-2" />
                            Zurücksetzen
                        </Button>
                    )}
                    <Button 
                        onClick={onSave}
                        disabled={!tempMarker}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Video, X, Upload, Image, Film, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MediaUploader({ 
    media = [], 
    onMediaChange, 
    maxFiles = 5,
    acceptVideo = true 
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (media.length + files.length > maxFiles) {
            toast.error(`Maximal ${maxFiles} Dateien erlaubt`);
            return;
        }

        setUploading(true);
        const newMedia = [];

        for (const file of files) {
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            if (!isVideo && !isImage) {
                toast.error(`${file.name} ist kein gültiges Bild oder Video`);
                continue;
            }

            if (file.size > 50 * 1024 * 1024) {
                toast.error(`${file.name} ist zu groß (max. 50MB)`);
                continue;
            }

            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                newMedia.push({
                    url: file_url,
                    type: isVideo ? 'video' : 'image',
                    name: file.name,
                    uploadedAt: new Date().toISOString()
                });
            } catch (error) {
                toast.error(`Fehler beim Hochladen von ${file.name}`);
            }
        }

        onMediaChange([...media, ...newMedia]);
        setUploading(false);
        
        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const removeMedia = (index) => {
        const newMedia = media.filter((_, i) => i !== index);
        onMediaChange(newMedia);
    };

    return (
        <div className="space-y-3">
            {/* Upload Buttons */}
            <div className="flex gap-2 flex-wrap">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {acceptVideo && (
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                )}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || media.length >= maxFiles}
                    className="flex-1"
                >
                    <Image className="w-4 h-4 mr-2" />
                    Galerie
                </Button>
                
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading || media.length >= maxFiles}
                    className="flex-1"
                >
                    <Camera className="w-4 h-4 mr-2" />
                    Foto
                </Button>

                {acceptVideo && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading || media.length >= maxFiles}
                        className="flex-1"
                    >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                    </Button>
                )}
            </div>

            {/* Upload Status */}
            {uploading && (
                <div className="flex items-center justify-center gap-2 p-3 bg-violet-50 rounded-lg text-violet-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Wird hochgeladen...</span>
                </div>
            )}

            {/* Media Preview */}
            <AnimatePresence>
                {media.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-3 gap-2"
                    >
                        {media.map((item, index) => (
                            <motion.div
                                key={item.url}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <Film className="w-8 h-8 text-white" />
                                        <video 
                                            src={item.url} 
                                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                                        />
                                    </div>
                                ) : (
                                    <img 
                                        src={item.url} 
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeMedia(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                {item.type === 'video' && (
                                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs">
                                        Video
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Counter */}
            <p className="text-xs text-gray-500 text-center">
                {media.length} / {maxFiles} Dateien
            </p>
        </div>
    );
}
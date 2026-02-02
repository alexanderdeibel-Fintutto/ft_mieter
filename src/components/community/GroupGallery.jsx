import React, { useState } from 'react';
import { Image, Plus, X, ZoomIn, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function GroupGallery({ photos, onUpload, canUpload = true }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle ein Bild aus');
      return;
    }

    setUploading(true);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // In a real app, you'd upload to server here
    // For demo, we'll use the preview URL
    onUpload({
      id: Date.now(),
      url: previewUrl,
      thumbnail: previewUrl,
      author: 'Du',
      created_at: new Date().toISOString(),
    });
    
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canUpload && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Button variant="outline" className="w-full" disabled={uploading}>
            <Plus className="w-4 h-4 mr-2" />
            {uploading ? 'Wird hochgeladen...' : 'Foto hinzufügen'}
          </Button>
        </div>
      )}

      {/* Gallery Grid */}
      {photos?.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div 
              key={photo.id}
              className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.thumbnail || photo.url} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Noch keine Fotos</p>
          <p className="text-xs text-gray-400">Teile Momente mit der Gruppe</p>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black border-none">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </button>
          
          {selectedPhoto && (
            <div className="relative">
              <img 
                src={selectedPhoto.url} 
                alt="" 
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm">{selectedPhoto.author}</p>
                <p className="text-white/70 text-xs">
                  {format(new Date(selectedPhoto.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
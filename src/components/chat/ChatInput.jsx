import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, X, File, Flame, Clock, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';

const AUTO_DELETE_OPTIONS = [
  { label: 'Aus', value: null, icon: null },
  { label: '30 Sekunden', value: 30, icon: '30s' },
  { label: '1 Minute', value: 60, icon: '1m' },
  { label: '5 Minuten', value: 300, icon: '5m' },
  { label: '1 Stunde', value: 3600, icon: '1h' },
  { label: '24 Stunden', value: 86400, icon: '24h' },
];

export default function ChatInput({ onSend, onTyping, disabled, enableAttachments = false }) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [autoDeleteSeconds, setAutoDeleteSeconds] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    const autoDeleteAt = autoDeleteSeconds 
      ? new Date(Date.now() + autoDeleteSeconds * 1000).toISOString()
      : null;
    
    onSend(message.trim(), attachments, autoDeleteAt);
    setMessage('');
    setAttachments([]);
    if (onTyping) onTyping(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} ist zu groß (max. 10MB)`);
        return false;
      }
      return true;
    });

    setUploading(true);
    
    for (const file of validFiles) {
      try {
        // Upload file to get permanent URL
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const newAttachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: type,
          url: file_url,
        };
        
        setAttachments(prev => [...prev, newAttachment]);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Upload fehlgeschlagen: ${file.name}`);
      }
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Standortfreigabe wird nicht unterstützt');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationAttachment = {
          id: Date.now() + Math.random(),
          name: 'Standort',
          type: 'location',
          latitude,
          longitude,
          url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        };
        setAttachments(prev => [...prev, locationAttachment]);
        setGettingLocation(false);
        toast.success('Standort hinzugefügt');
      },
      (error) => {
        setGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Standortzugriff verweigert');
        } else {
          toast.error('Standort konnte nicht ermittelt werden');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectedDeleteOption = AUTO_DELETE_OPTIONS.find(o => o.value === autoDeleteSeconds);

  return (
    <div className="border-t bg-white p-3">
      {/* Auto-delete indicator */}
      {autoDeleteSeconds && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-orange-50 rounded-lg text-orange-600 text-xs">
          <Flame className="w-3.5 h-3.5" />
          <span>Nachrichten werden nach {selectedDeleteOption?.label} automatisch gelöscht</span>
          <button 
            onClick={() => setAutoDeleteSeconds(null)}
            className="ml-auto hover:text-orange-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-violet-50 rounded-lg text-violet-600 text-xs">
          <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span>Wird hochgeladen...</span>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {attachments.map(attachment => (
            <div 
              key={attachment.id}
              className="relative bg-gray-100 rounded-lg overflow-hidden"
            >
              {attachment.type === 'image' ? (
                <div className="relative w-20 h-20">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : attachment.type === 'location' ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <div className="max-w-[120px]">
                    <p className="text-xs font-medium text-green-700">Standort</p>
                    <p className="text-xs text-green-600">Für Treffen teilen</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <File className="w-4 h-4 text-gray-500" />
                  <div className="max-w-[120px]">
                    <p className="text-xs font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {enableAttachments && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'file')}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={() => imageInputRef.current?.click()}
              title="Bild senden"
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Datei senden"
              disabled={uploading}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            {/* Location Share */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={handleShareLocation}
              disabled={gettingLocation}
              title="Standort teilen"
            >
              {gettingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </Button>

            {/* Auto-delete Timer */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`flex-shrink-0 ${autoDeleteSeconds ? 'text-orange-500 hover:text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Selbstlöschende Nachricht"
                >
                  <Flame className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs text-gray-500">
                  Nachricht automatisch löschen
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {AUTO_DELETE_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.value || 'off'}
                    onClick={() => setAutoDeleteSeconds(option.value)}
                    className={autoDeleteSeconds === option.value ? 'bg-orange-50 text-orange-600' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {option.value ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {option.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent resize-none outline-none text-sm"
            style={{ minHeight: '24px', maxHeight: '120px' }}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || disabled || uploading}
          size="icon"
          className={`rounded-full h-10 w-10 flex-shrink-0 ${
            autoDeleteSeconds 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-[#8B5CF6] hover:bg-violet-700'
          }`}
        >
          {autoDeleteSeconds ? <Flame className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
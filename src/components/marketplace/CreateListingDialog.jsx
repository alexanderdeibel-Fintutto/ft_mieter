import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImagePlus, X, Euro, Gift, Repeat2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { id: 'electronics', label: '📱 Elektronik' },
  { id: 'furniture', label: '🪑 Möbel' },
  { id: 'clothing', label: '👕 Kleidung' },
  { id: 'books', label: '📚 Bücher' },
  { id: 'sports', label: '⚽ Sport' },
  { id: 'garden', label: '🌱 Garten' },
  { id: 'kids', label: '👶 Kinder' },
  { id: 'household', label: '🏠 Haushalt' },
  { id: 'other', label: '📦 Sonstiges' },
];

const CONDITIONS = [
  { id: 'new', label: 'Neu' },
  { id: 'like_new', label: 'Wie neu' },
  { id: 'good', label: 'Gut' },
  { id: 'used', label: 'Gebraucht' },
  { id: 'defective', label: 'Defekt' },
];

export default function CreateListingDialog({ open, onOpenChange, onSubmit, editListing }) {
  const [formData, setFormData] = useState({
    type: 'offer',
    transactionType: 'sell',
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    tradeFor: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editListing) {
      setFormData({
        type: editListing.type || 'offer',
        transactionType: editListing.transactionType || 'sell',
        title: editListing.title || '',
        description: editListing.description || '',
        category: editListing.category || '',
        condition: editListing.condition || '',
        price: editListing.price?.toString() || '',
        tradeFor: editListing.tradeFor || '',
        images: editListing.images || [],
      });
    } else {
      setFormData({
        type: 'offer',
        transactionType: 'sell',
        title: '',
        description: '',
        category: '',
        condition: '',
        price: '',
        tradeFor: '',
        images: [],
      });
    }
  }, [editListing, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file_url]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: formData.transactionType === 'sell' ? parseFloat(formData.price) || 0 : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editListing ? 'Anzeige bearbeiten' : 'Neue Anzeige erstellen'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Art der Anzeige</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'offer' }))}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  formData.type === 'offer'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">🏷️ Biete</span>
                <p className="text-xs text-gray-500 mt-1">Ich habe etwas anzubieten</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'search' }))}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  formData.type === 'search'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">🔍 Suche</span>
                <p className="text-xs text-gray-500 mt-1">Ich suche etwas</p>
              </button>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Was möchtest du?</Label>
            <RadioGroup
              value={formData.transactionType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, transactionType: value }))}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="sell" id="sell" className="sr-only" />
                <Label
                  htmlFor="sell"
                  className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.transactionType === 'sell'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Euro className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-sm font-medium">Verkaufen</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="gift" id="gift" className="sr-only" />
                <Label
                  htmlFor="gift"
                  className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.transactionType === 'gift'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Gift className="w-5 h-5 text-pink-600 mb-1" />
                  <span className="text-sm font-medium">Verschenken</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="trade" id="trade" className="sr-only" />
                <Label
                  htmlFor="trade"
                  className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.transactionType === 'trade'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Repeat2 className="w-5 h-5 text-violet-600 mb-1" />
                  <span className="text-sm font-medium">Tauschen</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="z.B. IKEA Kallax Regal weiß"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibe den Artikel genauer..."
              rows={3}
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kategorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zustand</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(cond => (
                    <SelectItem key={cond.id} value={cond.id}>{cond.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price (only for sell) */}
          {formData.transactionType === 'sell' && (
            <div className="space-y-2">
              <Label htmlFor="price">Preis (€) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="z.B. 25"
                required
              />
            </div>
          )}

          {/* Trade for (only for trade) */}
          {formData.transactionType === 'trade' && (
            <div className="space-y-2">
              <Label htmlFor="tradeFor">Tauschen gegen</Label>
              <Input
                id="tradeFor"
                value={formData.tradeFor}
                onChange={(e) => setFormData(prev => ({ ...prev, tradeFor: e.target.value }))}
                placeholder="z.B. Bücher, Pflanzen, ..."
              />
            </div>
          )}

          {/* Images */}
          <div className="space-y-2">
            <Label>Bilder</Label>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#8B5CF6] hover:bg-violet-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-gray-400" />
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Max. 5 Bilder</p>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#8B5CF6] hover:bg-violet-700"
              disabled={!formData.title || !formData.description || !formData.category}
            >
              {editListing ? 'Speichern' : 'Veröffentlichen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
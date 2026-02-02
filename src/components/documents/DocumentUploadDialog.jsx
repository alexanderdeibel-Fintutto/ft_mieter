import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, File, X } from 'lucide-react';

export default function DocumentUploadDialog({
  isOpen,
  onClose,
  onUploadSuccess,
  entityType,
  entityId
}) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !category) {
      alert('Bitte wählen Sie eine Datei und Kategorie');
      return;
    }

    setUploading(true);
    
    // Upload file
    const uploadResponse = await base44.integrations.Core.UploadFile({
      file: file
    });

    if (uploadResponse.file_url) {
      // Create document record
      const doc = await base44.entities.Document.create({
        organization_id: entityType === 'org' ? entityId : '',
        building_id: entityType === 'building' ? entityId : '',
        entity_type: entityType,
        entity_id: entityId,
        file_name: fileName || file.name,
        file_url: uploadResponse.file_url,
        category: category,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        uploaded_by: 'current_user',
        is_public: false,
        visible_to_tenant: false
      });

      // Log the upload action
      await base44.functions.invoke('logAction', {
        action: 'create',
        entity_type: 'Document',
        entity_id: doc.id,
        entity_name: fileName || file.name,
        description: `Dokument hochgeladen: ${category}`,
        changes_summary: `Neue Datei: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        metadata: {
          category,
          file_size: file.size,
          tags: tags
        }
      });

      onUploadSuccess(doc);
      resetForm();
      onClose();
    }

    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setCategory('');
    setTags('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dokument hochladen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-blue-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <Upload size={32} className="text-gray-400" />
              <div className="text-center">
                <p className="font-medium">Datei hierher ziehen oder klicken</p>
                <p className="text-sm text-gray-500">PDF, DOC, IMG bis 50MB</p>
              </div>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <div className="flex items-center gap-2">
                <File size={16} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setFileName('');
                }}
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* File Name */}
          <Input
            placeholder="Dateiname (optional)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          {/* Category */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Vertrag</SelectItem>
              <SelectItem value="invoice">Rechnung</SelectItem>
              <SelectItem value="insurance">Versicherung</SelectItem>
              <SelectItem value="maintenance">Wartung</SelectItem>
              <SelectItem value="permit">Genehmigung</SelectItem>
              <SelectItem value="other">Sonstiges</SelectItem>
            </SelectContent>
          </Select>

          {/* Tags */}
          <Input
            placeholder="Tags (komma-getrennt)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
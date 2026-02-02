import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUploader({ 
    organizationId, 
    entityType, 
    entityId, 
    onUploadComplete 
}) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [category, setCategory] = useState('other');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validierung
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error('Datei zu groß (max. 10MB)');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('organization_id', organizationId);
            formData.append('entity_type', entityType);
            formData.append('entity_id', entityId);
            formData.append('category', category);
            formData.append('is_public', 'false');

            const response = await fetch('/api/functions/uploadDocument', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${await base44.auth.getToken()}`
                }
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            
            toast.success('Dokument erfolgreich hochgeladen');
            setSelectedFile(null);
            
            if (onUploadComplete) {
                onUploadComplete(result.document);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Fehler beim Hochladen');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">Dokument hochladen</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Kategorie
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Datei
                        </label>
                        <Input
                            type="file"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        />
                        {selectedFile && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <File className="w-4 h-4" />
                                <span>{selectedFile.name}</span>
                                <span className="text-xs">
                                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Wird hochgeladen...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Hochladen
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
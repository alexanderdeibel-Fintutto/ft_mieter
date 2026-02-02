import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UploadProgressBar from './UploadProgressBar';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function DocumentUploadZone({ onUpload, loading }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploads, setUploads] = useState([]);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Dateityp nicht unterstützt. Erlaubt: PDF, JPG, PNG, DOC, DOCX';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Datei zu groß. Maximum: 50MB';
        }
        return null;
    };

    const handleFiles = async (files) => {
        const newUploads = [];
        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                newUploads.push({
                    id: Math.random(),
                    name: file.name,
                    status: 'error',
                    error
                });
                continue;
            }

            const upload = {
                id: Math.random(),
                name: file.name,
                status: 'uploading',
                progress: 0,
                file
            };
            newUploads.push(upload);
        }

        setUploads(prev => [...prev, ...newUploads]);

        // Upload each file
        for (const upload of newUploads) {
            if (upload.file) {
                try {
                    // Simulate upload progress
                    for (let i = 0; i <= 100; i += 10) {
                        setUploads(prev =>
                            prev.map(u =>
                                u.id === upload.id
                                    ? { ...u, progress: i }
                                    : u
                            )
                        );
                        await new Promise(r => setTimeout(r, 100));
                    }

                    // Call actual upload
                    await onUpload(upload.file);

                    setUploads(prev =>
                        prev.map(u =>
                            u.id === upload.id
                                ? { ...u, status: 'success', progress: 100 }
                                : u
                        )
                    );

                    // Remove after delay
                    setTimeout(() => {
                        setUploads(prev => prev.filter(u => u.id !== upload.id));
                    }, 2000);
                } catch (error) {
                    setUploads(prev =>
                        prev.map(u =>
                            u.id === upload.id
                                ? { ...u, status: 'error', error: error.message }
                                : u
                        )
                    );
                }
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="font-medium text-gray-900 mb-1">Dokumente hochladen</p>
                <p className="text-sm text-gray-600 mb-4">
                    Ziehe Dateien hierher oder klicke zum Auswählen (Max. 50MB)
                </p>
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    Datei auswählen
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
            </div>

            {/* Upload Progress List */}
            {uploads.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                        Uploads: {uploads.filter(u => u.status === 'success').length} von {uploads.length} erfolgreich
                    </p>
                    <div className="space-y-2">
                        {uploads.map(upload => (
                            <div key={upload.id} className="relative">
                                <UploadProgressBar
                                    fileName={upload.name}
                                    progress={upload.progress}
                                    status={upload.status}
                                    error={upload.error}
                                />
                                {upload.status !== 'uploading' && (
                                    <button
                                        onClick={() => setUploads(prev => prev.filter(u => u.id !== upload.id))}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    FolderPlus, 
    Folder, 
    Trash2, 
    Edit2, 
    Loader2,
    FolderOpen,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

const FOLDER_COLORS = [
    { id: 'violet', color: 'bg-violet-500', light: 'bg-violet-100' },
    { id: 'blue', color: 'bg-blue-500', light: 'bg-blue-100' },
    { id: 'green', color: 'bg-green-500', light: 'bg-green-100' },
    { id: 'amber', color: 'bg-amber-500', light: 'bg-amber-100' },
    { id: 'red', color: 'bg-red-500', light: 'bg-red-100' },
    { id: 'pink', color: 'bg-pink-500', light: 'bg-pink-100' },
];

export function CreateFolderDialog({ open, onOpenChange, onCreateFolder, existingFolders }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('violet');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Bitte gib einen Ordnernamen ein');
            return;
        }
        if (existingFolders?.some(f => f.name.toLowerCase() === name.toLowerCase())) {
            toast.error('Ein Ordner mit diesem Namen existiert bereits');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 300));
        onCreateFolder({ name: name.trim(), color });
        setName('');
        setColor('violet');
        setLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-violet-600" />
                        Neuer Ordner
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <Label>Ordnername</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z.B. Baupläne, Versicherungen"
                        />
                    </div>

                    <div>
                        <Label>Farbe</Label>
                        <div className="flex gap-2 mt-2">
                            {FOLDER_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setColor(c.id)}
                                    className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center transition-all ${
                                        color === c.id ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                                    }`}
                                >
                                    {color === c.id && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !name.trim()}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function FolderCard({ folder, isSelected, onClick, onEdit, onDelete, documentCount }) {
    const colorConfig = FOLDER_COLORS.find(c => c.id === folder.color) || FOLDER_COLORS[0];

    return (
        <div
            onClick={onClick}
            className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected 
                    ? `${colorConfig.light} border-${folder.color}-400` 
                    : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorConfig.light}`}>
                    {isSelected ? (
                        <FolderOpen className={`w-5 h-5 text-${folder.color}-600`} />
                    ) : (
                        <Folder className={`w-5 h-5 text-${folder.color}-600`} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{folder.name}</p>
                    <p className="text-xs text-gray-500">{documentCount} Dokumente</p>
                </div>
            </div>
            
            {onEdit && onDelete && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(folder); }}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
                        className="p-1 hover:bg-red-50 rounded"
                    >
                        <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                </div>
            )}
        </div>
    );
}

export function FolderList({ folders, selectedFolder, onSelectFolder, onCreateFolder, onDeleteFolder, documents, isAdmin }) {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700 text-sm">Ordner</h3>
                {isAdmin && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="h-7 text-xs"
                    >
                        <FolderPlus className="w-3 h-3 mr-1" />
                        Neu
                    </Button>
                )}
            </div>

            {/* All Documents option */}
            <div
                onClick={() => onSelectFolder(null)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    !selectedFolder 
                        ? 'bg-violet-50 border-violet-200' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                        <Folder className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Alle Dokumente</p>
                        <p className="text-xs text-gray-500">{documents.length} Dokumente</p>
                    </div>
                </div>
            </div>

            {/* Custom Folders */}
            {folders.map(folder => (
                <FolderCard
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolder?.id === folder.id}
                    onClick={() => onSelectFolder(folder)}
                    onEdit={isAdmin ? () => {} : null}
                    onDelete={isAdmin ? onDeleteFolder : null}
                    documentCount={documents.filter(d => d.folder_id === folder.id).length}
                />
            ))}

            <CreateFolderDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreateFolder={onCreateFolder}
                existingFolders={folders}
            />
        </div>
    );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

export default function APIKeyManager({ keys, setKeys }) {
    const [showNew, setShowNew] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [visibleKeys, setVisibleKeys] = useState({});

    const toggleKeyVisibility = (id) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addKey = () => {
        if (newKeyName.trim()) {
            const newKey = {
                id: Math.max(...keys.map(k => k.id)) + 1,
                name: newKeyName,
                key: 'sk_live_' + Math.random().toString(36).substr(2, 11),
                created: new Date().toISOString().split('T')[0],
                lastUsed: '-',
                active: true
            };
            setKeys([newKey, ...keys]);
            setNewKeyName('');
            setShowNew(false);
        }
    };

    const deleteKey = (id) => {
        setKeys(keys.filter(k => k.id !== id));
    };

    const copyKey = (key) => {
        navigator.clipboard.writeText(key);
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => setShowNew(true)} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                <Plus className="w-4 h-4" /> Neuer Schlüssel
            </Button>

            {/* Keys List */}
            <div className="space-y-2">
                {keys.map(key => (
                    <Card key={key.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{key.name}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                            {visibleKeys[key.id] ? key.key : key.key.replace(/(.{12})(.*)/, '$1' + '•'.repeat(key.key.length - 12))}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleKeyVisibility(key.id)}
                                        >
                                            {visibleKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyKey(key.key)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Erstellt: {key.created} • Zuletzt: {key.lastUsed}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteKey(key.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New Key Dialog */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Neuen API-Schlüssel erstellen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-900 block mb-2">Schlüsselname</label>
                            <Input
                                placeholder="z.B. Mobile App"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>
                                Abbrechen
                            </Button>
                            <Button onClick={addKey} className="flex-1 bg-violet-600 hover:bg-violet-700">
                                Erstellen
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
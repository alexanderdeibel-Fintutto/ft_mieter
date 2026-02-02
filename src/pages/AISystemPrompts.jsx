import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Star, ShieldAlert } from 'lucide-react';
import useAuth from '../components/useAuth';

export default function AISystemPrompts() {
    const { user } = useAuth();
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState(null);
    
    const [formData, setFormData] = useState({
        prompt_key: '',
        prompt_name: '',
        feature: 'chat',
        system_prompt: '',
        is_default: false,
        is_active: true,
        tags: []
    });

    if (user && user.role !== 'admin') {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-red-800">
                            <ShieldAlert className="h-8 w-8" />
                            <div>
                                <h3 className="font-semibold text-lg">Zugriff verweigert</h3>
                                <p>Nur Administratoren können System-Prompts verwalten.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    useEffect(() => {
        if (user && user.role === 'admin') {
            loadPrompts();
        }
    }, [user]);

    const loadPrompts = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.AISystemPrompt.list('-created_date');
            setPrompts(data);
        } catch (error) {
            console.error('Failed to load prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Wenn is_default gesetzt, alle anderen für dieses Feature auf false
            if (formData.is_default) {
                const sameFeature = prompts.filter(p => p.feature === formData.feature && p.id !== editingPrompt?.id);
                for (const prompt of sameFeature) {
                    if (prompt.is_default) {
                        await base44.entities.AISystemPrompt.update(prompt.id, { is_default: false });
                    }
                }
            }

            if (editingPrompt) {
                await base44.entities.AISystemPrompt.update(editingPrompt.id, formData);
            } else {
                await base44.entities.AISystemPrompt.create({
                    ...formData,
                    prompt_key: formData.prompt_key || `custom_${Date.now()}`
                });
            }
            setDialogOpen(false);
            resetForm();
            loadPrompts();
        } catch (error) {
            console.error('Failed to save prompt:', error);
            alert('Fehler beim Speichern');
        }
    };

    const handleEdit = (prompt) => {
        setEditingPrompt(prompt);
        setFormData({
            prompt_key: prompt.prompt_key,
            prompt_name: prompt.prompt_name,
            feature: prompt.feature,
            system_prompt: prompt.system_prompt,
            is_default: prompt.is_default,
            is_active: prompt.is_active,
            tags: prompt.tags || []
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Prompt wirklich löschen?')) return;
        try {
            await base44.entities.AISystemPrompt.delete(id);
            loadPrompts();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const resetForm = () => {
        setEditingPrompt(null);
        setFormData({
            prompt_key: '',
            prompt_name: '',
            feature: 'chat',
            system_prompt: '',
            is_default: false,
            is_active: true,
            tags: []
        });
    };

    const getFeatureName = (feature) => {
        const names = {
            chat: 'Chat',
            ocr: 'OCR',
            analysis: 'Analyse',
            categorization: 'Kategorisierung',
            document_gen: 'Dokument-Generierung',
            recommendation: 'Empfehlungen'
        };
        return names[feature] || feature;
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    AI System-Prompts
                </h1>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Neuer Prompt
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPrompt ? 'Prompt bearbeiten' : 'Neuer System-Prompt'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Prompt-Name*</Label>
                                <Input
                                    value={formData.prompt_name}
                                    onChange={(e) => setFormData({...formData, prompt_name: e.target.value})}
                                    placeholder="z.B. Mietrecht Chat - Detailliert"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Feature*</Label>
                                <Select
                                    value={formData.feature}
                                    onValueChange={(value) => setFormData({...formData, feature: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chat">Chat</SelectItem>
                                        <SelectItem value="ocr">OCR</SelectItem>
                                        <SelectItem value="analysis">Analyse</SelectItem>
                                        <SelectItem value="categorization">Kategorisierung</SelectItem>
                                        <SelectItem value="document_gen">Dokument-Generierung</SelectItem>
                                        <SelectItem value="recommendation">Empfehlungen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>System-Prompt*</Label>
                                <Textarea
                                    value={formData.system_prompt}
                                    onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                                    placeholder="Du bist ein hilfreicher Assistent für..."
                                    rows={10}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500">
                                    Verfügbare Variablen: {'{user_name}'}, {'{context}'}, {'{topic}'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.is_default}
                                        onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
                                    />
                                    <Label>Als Standard setzen</Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                                    />
                                    <Label>Aktiv</Label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Abbrechen
                                </Button>
                                <Button onClick={handleSave}>
                                    Speichern
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Verfügbare System-Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Lade Prompts...</div>
                    ) : prompts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Noch keine System-Prompts erstellt
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Feature</TableHead>
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Nutzung</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prompts.map((prompt) => (
                                    <TableRow key={prompt.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {prompt.is_default && <Star className="h-4 w-4 text-yellow-500" />}
                                                <span className="font-medium">{prompt.prompt_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getFeatureName(prompt.feature)}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="text-sm text-gray-600 truncate">
                                                {prompt.system_prompt.substring(0, 100)}...
                                            </div>
                                        </TableCell>
                                        <TableCell>{prompt.usage_count || 0}x</TableCell>
                                        <TableCell>
                                            <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                                                {prompt.is_active ? 'Aktiv' : 'Inaktiv'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(prompt)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(prompt.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
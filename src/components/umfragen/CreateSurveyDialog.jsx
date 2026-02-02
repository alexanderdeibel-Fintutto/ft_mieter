import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
    ClipboardList,
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    Send,
    Star,
    ListChecks,
    MessageSquare,
    CircleDot
} from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_TYPES = [
    { id: 'single_choice', label: 'Einzelauswahl', icon: CircleDot, description: 'Eine Option wählbar' },
    { id: 'multiple_choice', label: 'Mehrfachauswahl', icon: ListChecks, description: 'Mehrere Optionen wählbar' },
    { id: 'rating', label: 'Bewertung', icon: Star, description: '1-5 Sterne' },
    { id: 'text', label: 'Freitext', icon: MessageSquare, description: 'Offene Antwort' },
];

function QuestionEditor({ question, index, onUpdate, onDelete }) {
    const typeConfig = QUESTION_TYPES.find(t => t.id === question.type);
    const TypeIcon = typeConfig?.icon || CircleDot;

    const updateOption = (optIndex, value) => {
        const newOptions = [...(question.options || [])];
        newOptions[optIndex] = value;
        onUpdate({ ...question, options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
        onUpdate({ ...question, options: newOptions });
    };

    const removeOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        onUpdate({ ...question, options: newOptions });
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
                <div className="p-1.5 bg-white rounded-lg mt-1">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                            Frage {index + 1}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig?.label}
                        </div>
                    </div>

                    <Input
                        value={question.question}
                        onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                        placeholder="Ihre Frage..."
                        className="font-medium"
                    />

                    {/* Options for choice questions */}
                    {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                        <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-${question.type === 'single_choice' ? 'full' : 'sm'} border-2 border-gray-300`} />
                                    <Input
                                        value={option}
                                        onChange={(e) => updateOption(optIndex, e.target.value)}
                                        className="flex-1 h-8 text-sm"
                                    />
                                    {question.options.length > 2 && (
                                        <button
                                            onClick={() => removeOption(optIndex)}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addOption}
                                className="text-xs h-7"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Option hinzufügen
                            </Button>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                            />
                            <span className="text-xs text-gray-600">Pflichtfeld</span>
                        </div>
                        <button
                            onClick={onDelete}
                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" />
                            Entfernen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreateSurveyDialog({ open, onOpenChange, onSubmit }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        ends_at: '',
        questions: [],
    });
    const [loading, setLoading] = useState(false);

    const addQuestion = (type) => {
        const newQuestion = {
            id: `q-${Date.now()}`,
            type,
            question: '',
            required: true,
            ...(type === 'single_choice' || type === 'multiple_choice' 
                ? { options: ['Option 1', 'Option 2'], multiple: type === 'multiple_choice' } 
                : {}),
        };
        setForm(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };

    const updateQuestion = (index, updatedQuestion) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === index ? updatedQuestion : q)
        }));
    };

    const deleteQuestion = (index) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error('Bitte gib einen Titel ein');
            return;
        }
        if (form.questions.length === 0) {
            toast.error('Füge mindestens eine Frage hinzu');
            return;
        }
        if (form.questions.some(q => !q.question.trim())) {
            toast.error('Alle Fragen müssen ausgefüllt sein');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit(form);
        setForm({ title: '', description: '', ends_at: '', questions: [] });
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-violet-600" />
                        Neue Umfrage erstellen
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <div>
                            <Label>Titel *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="z.B. Zufriedenheitsumfrage 2025"
                                required
                            />
                        </div>
                        <div>
                            <Label>Beschreibung</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Kurze Beschreibung der Umfrage..."
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label>Enddatum</Label>
                            <Input
                                type="date"
                                value={form.ends_at}
                                onChange={(e) => setForm(prev => ({ ...prev, ends_at: e.target.value ? `${e.target.value}T23:59:59` : '' }))}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <Label className="mb-2 block">Fragen ({form.questions.length})</Label>
                        
                        {form.questions.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-500">
                                <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">Noch keine Fragen</p>
                                <p className="text-xs">Füge unten eine Frage hinzu</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {form.questions.map((question, index) => (
                                    <QuestionEditor
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        onUpdate={(q) => updateQuestion(index, q)}
                                        onDelete={() => deleteQuestion(index)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Add Question Buttons */}
                        <div className="mt-3 p-3 bg-violet-50 rounded-xl">
                            <p className="text-xs text-violet-600 mb-2 font-medium">Frage hinzufügen:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {QUESTION_TYPES.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => addQuestion(type.id)}
                                            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-violet-200 hover:border-violet-400 transition-all text-left"
                                        >
                                            <Icon className="w-4 h-4 text-violet-600" />
                                            <div>
                                                <p className="text-xs font-medium">{type.label}</p>
                                                <p className="text-[10px] text-gray-500">{type.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            type="submit"
                            disabled={loading || !form.title.trim() || form.questions.length === 0}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Umfrage starten
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BarChart3,
    Users,
    Star,
    MessageSquare,
    PieChart,
    List,
    Calendar,
    Download
} from 'lucide-react';

function RatingResults({ question, responses }) {
    const ratings = responses.map(r => r.answers[question.id]).filter(r => r !== undefined);
    const average = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratings.filter(r => r === rating).length,
        percentage: ratings.length > 0 ? (ratings.filter(r => r === rating).length / ratings.length) * 100 : 0
    }));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-4 bg-amber-50 rounded-xl">
                <Star className="w-8 h-8 text-amber-400 fill-current" />
                <span className="text-3xl font-bold text-amber-600">{average}</span>
                <span className="text-gray-500">/ 5</span>
            </div>
            <div className="space-y-2">
                {distribution.reverse().map(d => (
                    <div key={d.rating} className="flex items-center gap-2">
                        <span className="w-8 text-sm text-gray-600">{d.rating} ★</span>
                        <Progress value={d.percentage} className="flex-1 h-3" />
                        <span className="w-12 text-xs text-gray-500 text-right">{d.count} ({Math.round(d.percentage)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ChoiceResults({ question, responses }) {
    const allAnswers = responses
        .map(r => r.answers[question.id])
        .filter(a => a !== undefined)
        .flat();
    
    const optionCounts = question.options.map(option => ({
        option,
        count: allAnswers.filter(a => a === option || (Array.isArray(a) && a.includes(option))).length,
        percentage: allAnswers.length > 0 
            ? (allAnswers.filter(a => a === option || (Array.isArray(a) && a.includes(option))).length / responses.length) * 100 
            : 0
    })).sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-2">
            {optionCounts.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.option}</span>
                        <span className="text-gray-500">{item.count} ({Math.round(item.percentage)}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-3" />
                </div>
            ))}
        </div>
    );
}

function TextResults({ question, responses }) {
    const textAnswers = responses
        .map(r => ({ text: r.answers[question.id], date: r.submitted_at }))
        .filter(a => a.text?.trim());

    if (textAnswers.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Keine Textantworten</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto">
            {textAnswers.map((answer, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{answer.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(answer.date).toLocaleDateString('de-DE')}
                    </p>
                </div>
            ))}
        </div>
    );
}

function ResponsesList({ responses, questions }) {
    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.map((response, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                            Antwort #{index + 1}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(response.submitted_at).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {questions.map(q => {
                            const answer = response.answers[q.id];
                            let displayAnswer = answer;
                            if (q.type === 'rating') displayAnswer = `${answer} ★`;
                            if (Array.isArray(answer)) displayAnswer = answer.join(', ');
                            if (!displayAnswer) displayAnswer = '-';
                            
                            return (
                                <div key={q.id} className="text-sm">
                                    <p className="text-gray-500 text-xs">{q.question}</p>
                                    <p className="text-gray-800">{displayAnswer}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function SurveyResultsDialog({ open, onOpenChange, survey }) {
    const [activeTab, setActiveTab] = useState('summary');

    if (!survey) return null;

    const questions = survey.questions || [];
    const responses = survey.responses || [];
    const responseRate = Math.round((responses.length / survey.total_recipients) * 100);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                        Ergebnisse: {survey.title}
                    </DialogTitle>
                </DialogHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-violet-50 rounded-xl p-2 text-center">
                        <p className="text-lg font-bold text-violet-600">{responses.length}</p>
                        <p className="text-xs text-violet-600">Antworten</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2 text-center">
                        <p className="text-lg font-bold text-green-600">{responseRate}%</p>
                        <p className="text-xs text-green-600">Quote</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2 text-center">
                        <p className="text-lg font-bold text-blue-600">{questions.length}</p>
                        <p className="text-xs text-blue-600">Fragen</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-full">
                        <TabsTrigger value="summary" className="flex-1 gap-1">
                            <PieChart className="w-3 h-3" />
                            Zusammenfassung
                        </TabsTrigger>
                        <TabsTrigger value="responses" className="flex-1 gap-1">
                            <List className="w-3 h-3" />
                            Einzelantworten
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4">
                        <TabsContent value="summary" className="mt-0 space-y-4">
                            {responses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Noch keine Antworten</p>
                                </div>
                            ) : (
                                questions.map((question, index) => (
                                    <div key={question.id} className="border rounded-xl p-4">
                                        <div className="flex items-start gap-2 mb-3">
                                            <Badge variant="outline" className="text-xs">
                                                {index + 1}
                                            </Badge>
                                            <h4 className="font-medium text-gray-900 text-sm">{question.question}</h4>
                                        </div>
                                        
                                        {question.type === 'rating' && (
                                            <RatingResults question={question} responses={responses} />
                                        )}
                                        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                                            <ChoiceResults question={question} responses={responses} />
                                        )}
                                        {question.type === 'text' && (
                                            <TextResults question={question} responses={responses} />
                                        )}
                                    </div>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="responses" className="mt-0">
                            {responses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>Noch keine Antworten</p>
                                </div>
                            ) : (
                                <ResponsesList responses={responses} questions={questions} />
                            )}
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
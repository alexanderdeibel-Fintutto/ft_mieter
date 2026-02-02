import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
    ClipboardList,
    Star,
    Loader2,
    Send,
    ChevronLeft,
    ChevronRight,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

function RatingQuestion({ value, onChange }) {
    return (
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
                <button
                    key={rating}
                    type="button"
                    onClick={() => onChange(rating)}
                    className={`p-2 rounded-lg transition-all ${
                        value >= rating 
                            ? 'text-amber-400 scale-110' 
                            : 'text-gray-300 hover:text-amber-200'
                    }`}
                >
                    <Star className={`w-8 h-8 ${value >= rating ? 'fill-current' : ''}`} />
                </button>
            ))}
        </div>
    );
}

function SingleChoiceQuestion({ options, value, onChange }) {
    return (
        <div className="space-y-2">
            {options.map((option, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        value === option
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        value === option ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                        {value === option && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm">{option}</span>
                </button>
            ))}
        </div>
    );
}

function MultipleChoiceQuestion({ options, value = [], onChange }) {
    const toggleOption = (option) => {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    return (
        <div className="space-y-2">
            {options.map((option, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        value.includes(option)
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        value.includes(option) ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                        {value.includes(option) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm">{option}</span>
                </button>
            ))}
            <p className="text-xs text-gray-500 text-center">Mehrfachauswahl möglich</p>
        </div>
    );
}

function TextQuestion({ value, onChange }) {
    return (
        <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ihre Antwort..."
            rows={4}
            className="resize-none"
        />
    );
}

export default function SurveyParticipateDialog({ open, onOpenChange, survey, onSubmit }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);

    if (!survey) return null;

    const questions = survey.questions || [];
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const updateAnswer = (value) => {
        setAnswers(prev => ({ ...prev, [question.id]: value }));
    };

    const canProceed = () => {
        if (!question.required) return true;
        const answer = answers[question.id];
        if (question.type === 'text') return answer?.trim();
        if (question.type === 'multiple_choice') return answer?.length > 0;
        return answer !== undefined && answer !== null;
    };

    const handleNext = () => {
        if (!canProceed()) {
            toast.error('Bitte beantworte diese Frage');
            return;
        }
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) {
            toast.error('Bitte beantworte diese Frage');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit(survey.id, answers);
        setCurrentQuestion(0);
        setAnswers({});
        setLoading(false);
    };

    const isLastQuestion = currentQuestion === questions.length - 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-violet-600" />
                        {survey.title}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Frage {currentQuestion + 1} von {questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <div className="py-4">
                    <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-1">
                            {question?.question}
                            {question?.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                    </div>

                    {/* Answer Input based on type */}
                    {question?.type === 'rating' && (
                        <RatingQuestion 
                            value={answers[question.id]} 
                            onChange={updateAnswer} 
                        />
                    )}
                    {question?.type === 'single_choice' && (
                        <SingleChoiceQuestion 
                            options={question.options} 
                            value={answers[question.id]} 
                            onChange={updateAnswer} 
                        />
                    )}
                    {question?.type === 'multiple_choice' && (
                        <MultipleChoiceQuestion 
                            options={question.options} 
                            value={answers[question.id]} 
                            onChange={updateAnswer} 
                        />
                    )}
                    {question?.type === 'text' && (
                        <TextQuestion 
                            value={answers[question.id]} 
                            onChange={updateAnswer} 
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentQuestion === 0}
                        className="flex-1"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Zurück
                    </Button>
                    
                    {isLastQuestion ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !canProceed()}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-1" />
                                    Absenden
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                        >
                            Weiter
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
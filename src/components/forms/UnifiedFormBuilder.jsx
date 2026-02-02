import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Punkt 5: Unified Form Builder
 * Zentrale Formularverwaltung für alle Apps mit konsistenter UX
 */
export default function UnifiedFormBuilder({ formConfig, onSubmit, loading = false }) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleFieldChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        // Lösche Fehler wenn Nutzer beginnt zu tippen
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        formConfig.fields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} ist erforderlich`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        await onSubmit(formData);
    };

    const renderField = (field) => {
        const fieldValue = formData[field.name] || '';
        const fieldError = errors[field.name];

        switch (field.type) {
            case 'text':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                            type="text"
                            placeholder={field.placeholder}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={fieldError ? 'border-red-500' : ''}
                        />
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            case 'email':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                            type="email"
                            placeholder={field.placeholder}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={fieldError ? 'border-red-500' : ''}
                        />
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            case 'number':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                            type="number"
                            placeholder={field.placeholder}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value))}
                            step={field.step || '0.01'}
                            className={fieldError ? 'border-red-500' : ''}
                        />
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Textarea
                            placeholder={field.placeholder}
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            rows={field.rows || 3}
                            className={fieldError ? 'border-red-500' : ''}
                        />
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Select value={fieldValue} onValueChange={(value) => handleFieldChange(field.name, value)}>
                            <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                                <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Input
                            type="date"
                            value={fieldValue}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className={fieldError ? 'border-red-500' : ''}
                        />
                        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{formConfig.title}</CardTitle>
                {formConfig.description && (
                    <p className="text-sm text-gray-600 mt-2">{formConfig.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formConfig.fields.map(field => renderField(field))}
                    
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Wird verarbeitet...
                            </>
                        ) : (
                            formConfig.submitLabel || 'Absenden'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

// Validators helper
export const validators = {
  required: (msg = 'erforderlich') => z.string().min(1, msg),
  email: (msg = 'Gültige E-Mail erforderlich') => z.string().email(msg),
  phone: (msg = 'Gültige Telefonnummer erforderlich') => z.string().regex(/^[+\d\s\-()]+$/, msg),
  minLength: (len, msg = `Mindestens ${len} Zeichen`) => z.string().min(len, msg),
};

export function FormBuilder({ fields = [], onSubmit }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e, field) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field.name]: value }));
    // Clear error on change
    if (errors[field.name]) {
      setErrors(prev => ({ ...prev, [field.name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} ist erforderlich`;
      }
      if (field.type === 'email' && formData[field.name]) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name]);
        if (!isValid) newErrors[field.name] = 'Gültige E-Mail erforderlich';
      }
      if (field.minLength && formData[field.name]?.length < field.minLength) {
        newErrors[field.name] = `Mindestens ${field.minLength} Zeichen`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field, idx) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Label htmlFor={field.name} className="block mb-2">
            {field.label}
            {field.required && <span className="text-red-600">*</span>}
          </Label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(e, field)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
              rows={4}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(e, field)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800"
            >
              <option value="">Wählen...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input
              id={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(e, field)}
              placeholder={field.placeholder}
            />
          )}

          {errors[field.name] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 flex items-center gap-2 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {errors[field.name]}
            </motion.div>
          )}
        </motion.div>
      ))}

      <Button type="submit" className="w-full gap-2">
        {submitted ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Erfolgreich!
          </>
        ) : (
          'Absenden'
        )}
      </Button>
    </form>
  );
}
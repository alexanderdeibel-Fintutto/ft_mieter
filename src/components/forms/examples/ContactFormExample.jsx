import React, { useState } from 'react';
import FormBuilder, { validators } from '../FormBuilder';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Validierungsschema mit Zod
const contactSchema = z.object({
  name: validators.required('Name ist erforderlich'),
  email: validators.email(),
  phone: validators.phone().optional(),
  subject: validators.required('Betreff ist erforderlich'),
  message: validators.minLength(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
  priority: z.string(),
  newsletter: z.boolean().optional(),
});

export default function ContactFormExample() {
  const [isLoading, setIsLoading] = useState(false);

  const fields = [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'Ihr Name',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-Mail',
      placeholder: 'ihre@email.de',
      required: true,
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Telefon',
      placeholder: '+49 123 456789',
      description: 'Optional - für Rückfragen',
    },
    {
      name: 'subject',
      type: 'select',
      label: 'Betreff',
      placeholder: 'Wählen Sie einen Betreff',
      required: true,
      options: [
        { value: 'anfrage', label: 'Allgemeine Anfrage' },
        { value: 'support', label: 'Support' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'andere', label: 'Andere' },
      ],
    },
    {
      name: 'priority',
      type: 'radio',
      label: 'Priorität',
      required: true,
      options: [
        { value: 'niedrig', label: 'Niedrig' },
        { value: 'mittel', label: 'Mittel' },
        { value: 'hoch', label: 'Hoch' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Nachricht',
      placeholder: 'Ihre Nachricht...',
      rows: 6,
      required: true,
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      checkboxLabel: 'Ich möchte den Newsletter abonnieren',
    },
  ];

  const handleSubmit = async (data, { reset }) => {
    setIsLoading(true);
    
    // Simuliere API-Call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', data);
    toast.success('Nachricht erfolgreich gesendet!');
    reset();
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Kontaktformular</CardTitle>
          <CardDescription>
            Beispiel für ein wiederverwendbares Formular mit Validierung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormBuilder
            fields={fields}
            validationSchema={contactSchema}
            onSubmit={handleSubmit}
            submitLabel="Nachricht senden"
            isLoading={isLoading}
            defaultValues={{
              priority: 'mittel',
              newsletter: false,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
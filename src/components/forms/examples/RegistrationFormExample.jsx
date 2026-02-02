import React, { useState } from 'react';
import FormBuilder, { validators } from '../FormBuilder';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const registrationSchema = z.object({
  username: validators.minLength(3, 'Benutzername muss mindestens 3 Zeichen lang sein'),
  email: validators.email(),
  password: validators.minLength(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string(),
  userType: validators.required('Bitte wählen Sie einen Benutzertyp'),
  terms: z.boolean().refine(val => val === true, {
    message: 'Sie müssen den Bedingungen zustimmen',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

export default function RegistrationFormExample() {
  const [isLoading, setIsLoading] = useState(false);

  const fields = [
    {
      name: 'username',
      type: 'text',
      label: 'Benutzername',
      placeholder: 'Benutzername wählen',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-Mail-Adresse',
      placeholder: 'ihre@email.de',
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Passwort',
      placeholder: '••••••••',
      required: true,
      description: 'Mindestens 8 Zeichen',
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Passwort bestätigen',
      placeholder: '••••••••',
      required: true,
    },
    {
      name: 'userType',
      type: 'select',
      label: 'Ich bin...',
      placeholder: 'Auswählen',
      required: true,
      options: [
        { value: 'mieter', label: 'Mieter' },
        { value: 'vermieter', label: 'Vermieter' },
        { value: 'hausmeister', label: 'Hausmeister' },
      ],
    },
    {
      name: 'terms',
      type: 'checkbox',
      checkboxLabel: 'Ich akzeptiere die Nutzungsbedingungen und Datenschutzerklärung',
      required: true,
    },
  ];

  const handleSubmit = async (data, { reset }) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Registration data:', data);
    toast.success('Registrierung erfolgreich!');
    reset();
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrierung</CardTitle>
        </CardHeader>
        <CardContent>
          <FormBuilder
            fields={fields}
            validationSchema={registrationSchema}
            onSubmit={handleSubmit}
            submitLabel="Konto erstellen"
            isLoading={isLoading}
            defaultValues={{
              terms: false,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
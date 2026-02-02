import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactFormExample from '../components/forms/examples/ContactFormExample';
import RegistrationFormExample from '../components/forms/examples/RegistrationFormExample';
import { FileText, UserPlus } from 'lucide-react';

export default function FormExamples() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Formular-Beispiele</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Wiederverwendbare Formulare mit Validierung und Error-States
          </p>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Kontaktformular
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Registrierung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <ContactFormExample />
          </TabsContent>

          <TabsContent value="registration">
            <RegistrationFormExample />
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>✓ Text, Textarea, Select, Checkbox, Radio-Felder</li>
            <li>✓ Integrierte Validierung (E-Mail, Pflichtfelder, Min/Max-Länge)</li>
            <li>✓ Visuelle Error-States mit Icons</li>
            <li>✓ Einfache API mit Zod-Schema</li>
            <li>✓ Loading-States beim Submit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
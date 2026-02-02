import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import useSupabaseAuth from '../components/auth/useSupabaseAuth';
import { createPageUrl } from '@/utils';

export default function SupabaseRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { register } = useSupabaseAuth();

  const validatePassword = () => {
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    const result = await register(email, password);

    if (result.success) {
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate(createPageUrl('SupabaseLogin'));
      }, 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Registrierung erfolgreich</h2>
            <p className="text-gray-600 mb-4">
              Bestätigungsmail wurde gesendet. Bitte überprüfen Sie Ihre Inbox.
            </p>
            <p className="text-sm text-gray-500">
              Sie werden in 3 Sekunden zur Anmeldeseite weitergeleitet...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Konto erstellen</CardTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            Sichere Registrierung mit Supabase
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passwort</label>
              <Input
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Passwort bestätigen</label>
              <Input
                type="password"
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Wird registriert...' : 'Konto erstellen'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Bereits registriert?{' '}
              <a
                href={createPageUrl('SupabaseLogin')}
                className="text-blue-600 hover:underline"
              >
                Anmelden
              </a>
            </div>

            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
              ✓ Sichere Authentifizierung über Supabase<br/>
              ✓ Bestätigung per Email erforderlich<br/>
              ✓ Passwort verschlüsselt gespeichert
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
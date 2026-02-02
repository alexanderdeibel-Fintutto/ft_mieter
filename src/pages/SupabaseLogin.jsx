import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import useSupabaseAuth from '../components/auth/useSupabaseAuth';
import { createPageUrl } from '@/utils';

export default function SupabaseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();
  const { login, resetPassword } = useSupabaseAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(createPageUrl('Home'));
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await resetPassword(email);

    if (result.success) {
      setError('');
      alert('Passwort-Reset-Link wurde an Ihre Email gesendet');
      setShowForgot(false);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Anmelden</CardTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            Mit Supabase gesichert
          </p>
        </CardHeader>

        <CardContent>
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Wird angemeldet...' : 'Anmelden'}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-blue-600 hover:underline"
                >
                  Passwort vergessen?
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Noch kein Konto?{' '}
                <a
                  href={createPageUrl('SupabaseRegister')}
                  className="text-blue-600 hover:underline"
                >
                  Registrieren
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Geben Sie Ihre Email ein und wir senden Ihnen einen Passwort-Reset-Link.
              </p>

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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgot(false)}
                >
                  Zurück
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
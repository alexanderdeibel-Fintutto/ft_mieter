import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { sendMagicLink, signIn, signInWithGoogle, resetPassword } from '../components/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Bitte gib deine E-Mail-Adresse ein');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                // Login mit Passwort
                if (!password) {
                    toast.error('Bitte gib dein Passwort ein');
                    setLoading(false);
                    return;
                }
                await signIn({ email, password });
                toast.success('Erfolgreich angemeldet!');
                navigate(createPageUrl('Home'));
            } else {
                // Registrierung mit Magic Link
                await sendMagicLink(email);
                toast.success('✓ Wir haben dir einen Link geschickt! Prüfe deine E-Mails und klicke auf den Link.');
                setEmail('');
            }
        } catch (error) {
            toast.error(error.message || (isLogin ? 'Login fehlgeschlagen' : 'Fehler beim Senden des Codes'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            toast.error('Bitte gib deine E-Mail-Adresse ein');
            return;
        }

        try {
            await resetPassword(email);
            toast.success('Passwort-Reset-Link wurde gesendet!');
            setShowPasswordReset(false);
        } catch (error) {
            toast.error('Fehler beim Zurücksetzen des Passworts');
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error('Google-Anmeldung fehlgeschlagen');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">M</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">MieterApp</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Melde dich an' : 'Erstelle dein Konto'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                !isLogin
                                    ? 'bg-white text-[#8B5CF6] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Neu hier?
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                isLogin
                                    ? 'bg-white text-[#8B5CF6] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Schon dabei?
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <Input
                                type="email"
                                placeholder="deine@email.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="w-full"
                            />
                            {isLogin && (
                                <Input
                                    type="password"
                                    placeholder="Passwort"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="w-full"
                                />
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isLogin ? 'Melde an...' : 'Sende Code...'}
                                </>
                            ) : (
                                <>
                                    {isLogin ? <Lock className="w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                    {isLogin ? 'Anmelden' : 'Magic Link senden'}
                                </>
                            )}
                        </Button>
                        {isLogin && (
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                className="w-full text-sm text-[#8B5CF6] hover:underline"
                            >
                                Passwort vergessen?
                            </button>
                        )}
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Oder</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleAuth}
                        type="button"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Mit Google anmelden
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
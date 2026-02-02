import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PasswordProtectedShare({ open, onOpenChange, onProtect }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProtect = async () => {
    if (requirePassword && !password) {
      toast.error('Passwort erforderlich');
      return;
    }

    if (requirePassword && password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    if (requirePassword && password.length < 6) {
      toast.error('Passwort muss mind. 6 Zeichen lang sein');
      return;
    }

    setLoading(true);
    try {
      await onProtect({
        requirePassword,
        password: requirePassword ? password : null,
      });

      setPassword('');
      setConfirmPassword('');
      setRequirePassword(false);
      onOpenChange(false);
      toast.success('Share-Schutz aktiviert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Share-Schutz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              checked={requirePassword}
              onCheckedChange={setRequirePassword}
            />
            <label className="text-sm font-medium text-gray-700">
              Mit Passwort schützen
            </label>
          </div>

          {requirePassword && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Passwort</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Passwort bestätigen</label>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
                ⚠️ Der Empfänger benötigt dieses Passwort um das Dokument zu öffnen
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleProtect}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Speichern
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
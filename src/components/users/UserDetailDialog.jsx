import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Shield, Trash2 } from 'lucide-react';

export default function UserDetailDialog({ user, onClose }) {
    const [role, setRole] = useState(user.role);

    return (
        <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0)}
                        </div>
                        {user.full_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Info */}
                    <Card>
                        <CardContent className="space-y-3 pt-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">E-Mail</p>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Wohnung</p>
                                    <p className="text-sm font-medium">{user.apartment}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Beigetreten</p>
                                    <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('de-DE')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Rolle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex gap-2">
                                <Button
                                    variant={role === 'user' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRole('user')}
                                    className={role === 'user' ? 'bg-violet-600' : ''}
                                >
                                    Benutzer
                                </Button>
                                <Button
                                    variant={role === 'admin' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRole('admin')}
                                    className={role === 'admin' ? 'bg-purple-600' : ''}
                                >
                                    Admin
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Abbrechen
                        </Button>
                        <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                            Speichern
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
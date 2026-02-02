import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileSection({ user, supabaseProfile }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" /> Profil-Übersicht
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold">
                        {supabaseProfile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {supabaseProfile?.first_name ? `${supabaseProfile.first_name} ${supabaseProfile.last_name || ''}` : user?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {supabaseProfile?.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{supabaseProfile.phone}</span>
                        </div>
                    )}
                    {supabaseProfile?.address && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{supabaseProfile.address}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
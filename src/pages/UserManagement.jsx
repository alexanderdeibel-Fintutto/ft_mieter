import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Search, Shield, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import useAuth from '../components/useAuth';
import UserDetailDialog from '../components/users/UserDetailDialog';

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.role !== 'admin') return;
        loadUsers();
    }, [currentUser]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Mock data - würde normalerweise von Base44 kommen
            const mockUsers = [
                { id: 1, email: 'anna@example.de', full_name: 'Anna Schmidt', role: 'user', created_at: '2025-06-15', status: 'active', apartment: 'Wohnung 2.1' },
                { id: 2, email: 'max@example.de', full_name: 'Max Müller', role: 'user', created_at: '2025-07-20', status: 'active', apartment: 'Wohnung 3.4' },
                { id: 3, email: 'lisa@example.de', full_name: 'Lisa Wagner', role: 'admin', created_at: '2025-01-10', status: 'active', apartment: 'Wohnung 1.1' },
                { id: 4, email: 'thomas@example.de', full_name: 'Thomas Klein', role: 'user', created_at: '2025-08-05', status: 'inactive', apartment: 'Wohnung 2.3' },
            ];
            setUsers(mockUsers);
            setFilteredUsers(mockUsers);
        } catch (error) {
            console.error('Fehler beim Laden der Nutzer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = users.filter(u =>
            u.full_name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                Zugriff verweigert. Admin-Rechte erforderlich.
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6" /> Nutzerverwaltung
                </h1>
                <p className="text-gray-600 text-sm mt-1">{users.length} Nutzer gesamt</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Nach Name oder E-Mail suchen..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Users List */}
            <div className="space-y-2">
                {loading ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                        </CardContent>
                    </Card>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <Card key={user.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.full_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{user.full_name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">{user.apartment}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {user.role === 'admin' && (
                                                <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </Badge>
                                            )}
                                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Keine Nutzer gefunden</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* User Detail Dialog */}
            {selectedUser && (
                <UserDetailDialog
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
}
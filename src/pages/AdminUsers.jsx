import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, MoreVertical, Shield, Ban } from 'lucide-react';

const USERS_DATA = [
  { id: 1, name: 'Max Mustermann', email: 'max@example.com', role: 'admin', status: 'active', joined: '2025-01-01', lastActive: '2026-01-24' },
  { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', role: 'user', status: 'active', joined: '2025-06-15', lastActive: '2026-01-24' },
  { id: 3, name: 'Peter Weber', email: 'peter@example.com', role: 'user', status: 'inactive', joined: '2025-03-20', lastActive: '2026-01-10' },
  { id: 4, name: 'Lisa Müller', email: 'lisa@example.com', role: 'moderator', status: 'active', joined: '2025-07-01', lastActive: '2026-01-23' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = USERS_DATA.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())) &&
    (selectedRole === 'all' || user.role === selectedRole)
  );

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="w-6 h-6" /> Nutzerverwaltung
      </h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Nach Name oder E-Mail suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Alle Rollen</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">Benutzer</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredUsers.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={`${
                      user.role === 'admin' ? 'bg-red-50 text-red-700' :
                      user.role === 'moderator' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {user.role}
                    </Badge>
                    <Badge className={user.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}>
                      {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Letzter Besuch: {user.lastActive}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Shield className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Ban className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
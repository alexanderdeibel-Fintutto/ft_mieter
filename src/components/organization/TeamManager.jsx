import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trash2, Shield, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function TeamManager({ orgId, userRole }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMembers();
    }, [orgId]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const response = await base44.functions.invoke('manageUserOrganization', {
                action: 'list_members',
                org_id: orgId
            });
            setMembers(response.data.members);
        } catch (error) {
            console.error('Load members error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Mitglied entfernen?')) return;

        try {
            await base44.functions.invoke('manageUserOrganization', {
                action: 'remove_member',
                org_id: orgId,
                member_user_id: memberId
            });
            loadMembers();
        } catch (error) {
            console.error('Remove member error:', error);
        }
    };

    const handleChangeRole = async (memberId, newRole) => {
        try {
            await base44.functions.invoke('manageUserOrganization', {
                action: 'update_role',
                org_id: orgId,
                member_user_id: memberId,
                new_role: newRole
            });
            loadMembers();
        } catch (error) {
            console.error('Update role error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team ({members.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {members.map((item) => (
                        <div
                            key={item.membership.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex-1">
                                <p className="font-medium">{item.user.full_name || item.user.email}</p>
                                <p className="text-xs text-gray-500">{item.user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {userRole === 'owner' && item.membership.role !== 'owner' ? (
                                    <>
                                        <Select
                                            value={item.membership.role}
                                            onValueChange={(value) =>
                                                handleChangeRole(item.membership.id, value)
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Mitglied</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveMember(item.membership.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        <Shield className="w-3 h-3" />
                                        {item.membership.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
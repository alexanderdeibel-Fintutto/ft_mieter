import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, X, Loader2, Crown, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';

export default function TeamShareDialog({ open, onOpenChange, documentId, onShare }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  const ROLE_INFO = {
    owner: { label: 'Owner', icon: Crown, color: 'bg-amber-100 text-amber-700', canDelete: true },
    editor: { label: 'Editor', icon: Pencil, color: 'bg-blue-100 text-blue-700', canDelete: false },
    viewer: { label: 'Viewer', icon: Eye, color: 'bg-gray-100 text-gray-700', canDelete: false },
  };

  const addTeamMember = async () => {
    if (!newMemberEmail) {
      toast.error('E-Mail erforderlich');
      return;
    }

    if (teamMembers.find(m => m.email === newMemberEmail)) {
      toast.error('Mitglied bereits hinzugefügt');
      return;
    }

    const newMember = {
      id: Date.now(),
      email: newMemberEmail,
      role: memberRole,
      addedAt: new Date().toISOString(),
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail('');
    setMemberRole('viewer');
  };

  const removeMember = (memberId) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const updateMemberRole = (memberId, newRole) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  const handleShare = async () => {
    if (teamMembers.length === 0) {
      toast.error('Mindestens ein Mitglied erforderlich');
      return;
    }

    setLoading(true);
    try {
      // Erstelle Team-Share Einträge
      const shareRecords = teamMembers.map(member => ({
        document_id: documentId,
        shared_with_user_id: member.email,
        access_level: member.role === 'owner' ? 'edit' : (member.role === 'editor' ? 'edit' : 'view'),
        share_type: 'team',
        team_metadata: {
          role: member.role,
          added_at: member.addedAt,
        },
      }));

      const { error } = await supabase
        .from('document_shares')
        .insert(shareRecords);

      if (error) throw error;

      toast.success(`Dokument mit ${teamMembers.length} Mitgliedern geteilt`);
      setTeamMembers([]);
      onOpenChange(false);
      onShare?.();
    } catch (error) {
      console.error('Error sharing with team:', error);
      toast.error('Fehler beim Teilen');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team-Freigabe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Member */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mitglied hinzufügen</label>
            <div className="flex gap-2">
              <Input
                placeholder="name@example.de"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                type="email"
              />
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addTeamMember} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Team Members List */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mitglieder ({teamMembers.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Keine Mitglieder hinzugefügt</p>
              ) : (
                teamMembers.map(member => {
                  const RoleIcon = ROLE_INFO[member.role].icon;
                  return (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={member.role} onValueChange={(v) => updateMemberRole(member.id, v)}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleShare}
              disabled={loading || teamMembers.length === 0}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Team-Freigabe erstellen
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
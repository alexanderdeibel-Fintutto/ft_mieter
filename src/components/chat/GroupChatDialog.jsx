import React, { useState } from 'react';
import { createGroupChat } from '../services/messagingAdvanced';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

export function GroupChatDialog({ onGroupCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddMember = (userId) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId));
  };

  const handleCreate = async () => {
    setLoading(true);
    const result = await createGroupChat(name, selectedMembers, { description });
    if (result.success) {
      onGroupCreated?.(result.groupChat);
      setName('');
      setDescription('');
      setSelectedMembers([]);
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus size={16} /> Gruppe erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Gruppe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gruppenname</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Nachbarn 3. OG"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in dieser Gruppe?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mitglieder</label>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(memberId => (
                <div
                  key={memberId}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>Nutzer</span>
                  <button
                    onClick={() => handleRemoveMember(memberId)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name || loading}
              className="flex-1"
            >
              {loading ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
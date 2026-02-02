import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Trash2, Edit2, Plus, Wifi, WifiOff, History } from 'lucide-react';
import useSupabaseProjectsAdvanced from '../hooks/useSupabaseProjectsAdvanced';

export default function ProjectManagerAdvanced() {
  const { projects, loading, error, isOnline, createProject, updateProject, deleteProject, bulkDelete, getAuditLog } = useSupabaseProjectsAdvanced();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState(new Set());
  const [auditLog, setAuditLog] = useState(null);
  const [showAudit, setShowAudit] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = editingId
      ? await updateProject(editingId, formData.name, formData.description)
      : await createProject(formData.name, formData.description);

    if (result.success) {
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Wirklich löschen?')) {
      await deleteProject(id);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0 || !confirm(`${selected.size} Projekte löschen?`)) return;
    await bulkDelete(Array.from(selected));
    setSelected(new Set());
  };

  const handleViewAudit = async (projectId) => {
    const result = await getAuditLog(projectId);
    if (result.success) {
      setShowAudit(projectId);
      setAuditLog(result.data);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meine Projekte</h1>
        <div className="flex gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Wifi size={16} />
              Online
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <WifiOff size={16} />
              Offline
            </div>
          )}
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={18} />
            Neu
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selected.size > 0 && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4 flex justify-between items-center">
            <span className="text-sm font-medium">{selected.size} ausgewählt</span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Löschen
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Bearbeiten' : 'Neues Projekt'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Beschreibung"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '' });
                }}>
                  Abbrechen
                </Button>
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showAudit && auditLog && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Änderungsverlauf</CardTitle>
              <button
                onClick={() => {
                  setShowAudit(null);
                  setAuditLog(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLog.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Änderungen</p>
            ) : (
              auditLog.map((log) => (
                <div key={log.id} className="text-sm border-l-2 border-blue-300 pl-3">
                  <p className="font-medium capitalize">{log.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('de-DE')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Noch keine Projekte</p>
            <Button onClick={() => setShowForm(true)}>Erstes Projekt</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={project._optimistic ? 'opacity-70' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(project.id)}
                    onChange={() => toggleSelect(project.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600">{project.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(project.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewAudit(project.id)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <History size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
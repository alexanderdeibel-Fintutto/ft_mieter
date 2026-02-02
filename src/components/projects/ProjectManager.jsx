import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Trash2, Edit2, Plus } from 'lucide-react';
import useSupabaseProjects from '../hooks/useSupabaseProjects';

export default function ProjectManager() {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useSupabaseProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = editingId
      ? await updateProject(editingId, formData.name, formData.description)
      : await createProject(formData.name, formData.description);

    if (result.success) {
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
    }

    setSubmitting(false);
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
      await deleteProject(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meine Projekte</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={18} />
          Neues Projekt
        </Button>
      </div>

      {error && (
        <div className="flex gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Projektname</label>
                <Input
                  type="text"
                  placeholder="z.B. Webseite Redesign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Beschreibung</label>
                <Input
                  type="text"
                  placeholder="Kurze Beschreibung des Projekts"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Projekte werden geladen...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Noch keine Projekte vorhanden</p>
            <Button onClick={() => setShowForm(true)}>
              Erstes Projekt erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Erstellt: {new Date(project.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
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
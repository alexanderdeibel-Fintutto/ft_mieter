import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

export default function AuditLogSearchFilter({ onFilter }) {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFilter = () => {
    onFilter({
      search,
      action,
      entityType,
      dateFrom,
      dateTo
    });
  };

  const handleReset = () => {
    setSearch('');
    setAction('');
    setEntityType('');
    setDateFrom('');
    setDateTo('');
    onFilter({});
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <Input
            placeholder="Nach Benutzer, Entität oder Beschreibung suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Aktionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Aktionen</SelectItem>
                <SelectItem value="create">Erstellen</SelectItem>
                <SelectItem value="update">Aktualisieren</SelectItem>
                <SelectItem value="delete">Löschen</SelectItem>
                <SelectItem value="download">Herunterladen</SelectItem>
                <SelectItem value="share">Teilen</SelectItem>
                <SelectItem value="permission_change">Berechtigung ändern</SelectItem>
                <SelectItem value="view">Anschauen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Entitäten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Alle Entitäten</SelectItem>
                <SelectItem value="Document">Dokument</SelectItem>
                <SelectItem value="DocumentPermission">Berechtigung</SelectItem>
                <SelectItem value="WorkflowRule">Workflow-Regel</SelectItem>
                <SelectItem value="MaintenanceTask">Aufgabe</SelectItem>
                <SelectItem value="Message">Nachricht</SelectItem>
                <SelectItem value="User">Benutzer</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Von"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Bis"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilter} className="gap-2 flex-1">
              <Search size={16} />
              Filtern
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <X size={16} />
              Zurücksetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
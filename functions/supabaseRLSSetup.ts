// SUPABASE ROW LEVEL SECURITY SETUP
// Führe folgende SQL-Befehle in der Supabase SQL-Console aus:

/*

=== 1. Projekte Tabelle mit RLS ===

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur eigene Projekte sehen
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Benutzer können nur eigene Projekte erstellen
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Benutzer können nur ihre eigenen Projekte aktualisieren
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Benutzer können nur ihre eigenen Projekte löschen
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = auth.uid()::TEXT);

-- Indexes für Performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);


=== 2. Audit Log Tabelle mit RLS ===

CREATE TABLE IF NOT EXISTS project_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON project_audit FOR SELECT
  USING (user_id = auth.uid()::TEXT);

CREATE INDEX idx_project_audit_project_id ON project_audit(project_id);
CREATE INDEX idx_project_audit_created_at ON project_audit(created_at);


=== 3. Realtime aktivieren ===

Gehe in Supabase Dashboard:
1. Navigiere zu "Replication" im linken Menü
2. Wähle "projects" und "project_audit" aus
3. Speichern


=== 4. Weitere Tabellen und Policies ===

Du kannst dieses Pattern für weitere Entitäten verwenden:

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project tasks"
  ON tasks FOR ALL
  USING (
    user_id = auth.uid()::TEXT OR 
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()::TEXT)
  );

*/

export const RLS_SETUP_GUIDE = `
SUPABASE RLS IMPLEMENTATION GUIDE

1. Öffne Supabase Dashboard
2. Gehe zu SQL Editor
3. Kopiere und führe oben stehende SQL-Befehle aus
4. Überprüfe "Replication" für Live-Updates
5. Teste mit den Advanced Hooks
`;
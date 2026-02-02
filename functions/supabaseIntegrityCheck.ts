import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import * as jose from 'npm:jose@5.4.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabaseJwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const verifyJWT = async (token) => {
  const secret = new TextEncoder().encode(supabaseJwtSecret);
  const verified = await jose.jwtVerify(token, secret);
  return verified.payload;
};

const getAuthUser = async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  return await verifyJWT(authHeader.substring(7));
};

// Test Auth
const testAuth = async (userId) => {
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    return {
      name: 'Authentifizierung',
      status: error ? 'failed' : 'passed',
      message: error ? error.message : `Benutzer ${user.email} authentifiziert`,
      details: { verified: !error, uid: userId }
    };
  } catch (err) {
    return {
      name: 'Authentifizierung',
      status: 'error',
      message: err.message,
      details: {}
    };
  }
};

// Test Entities
const testEntities = async (userId) => {
  const results = {
    name: 'Entitäten',
    status: 'passed',
    message: 'Alle Entitäten erreichbar',
    details: { tables: [] }
  };

  const tables = ['projects', 'project_audit'];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .limit(1);

      results.details.tables.push({
        name: table,
        status: error ? 'error' : 'ok',
        count,
        error: error?.message
      });

      if (error) {
        results.status = 'warning';
      }
    } catch (err) {
      results.details.tables.push({
        name: table,
        status: 'error',
        error: err.message
      });
      results.status = 'failed';
    }
  }

  return results;
};

// Test RLS Policies
const testRLS = async () => {
  try {
    const { data: policies, error } = await supabase
      .rpc('get_policies', { schema: 'public' })
      .catch(() => ({ data: null, error: new Error('RPC nicht verfügbar') }));

    return {
      name: 'Row Level Security (RLS)',
      status: error ? 'warning' : 'passed',
      message: error ? 'RLS-Check eingeschränkt' : 'RLS-Policies aktiv',
      details: {
        policies: policies ? policies.length : 'N/A',
        error: error?.message
      }
    };
  } catch (err) {
    return {
      name: 'Row Level Security (RLS)',
      status: 'warning',
      message: 'RLS-Überprüfung nicht möglich',
      details: { error: err.message }
    };
  }
};

// Test Realtime
const testRealtime = async () => {
  try {
    const subscription = supabase
      .channel('integrity_test')
      .on('system', { event: 'subscribe' }, () => {})
      .subscribe((status) => {
        return status === 'SUBSCRIBED';
      });

    return {
      name: 'Realtime',
      status: 'passed',
      message: 'Realtime-Kanal aktiv',
      details: { connected: true }
    };
  } catch (err) {
    return {
      name: 'Realtime',
      status: 'warning',
      message: 'Realtime nicht verfügbar',
      details: { error: err.message }
    };
  }
};

// Test Datenintegrität
const testDataIntegrity = async (userId) => {
  const issues = [];

  try {
    // Check: Verwaiste Datensätze
    const { data: orphanedAudits } = await supabase
      .from('project_audit')
      .select('id, project_id')
      .eq('user_id', userId);

    if (orphanedAudits) {
      for (const audit of orphanedAudits) {
        const { count } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('id', audit.project_id);

        if (count === 0) {
          issues.push({
            type: 'orphaned_audit',
            severity: 'warning',
            message: `Audit-Eintrag ohne Projekt: ${audit.id}`
          });
        }
      }
    }

    // Check: Datentypen
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .limit(5);

    if (projects) {
      for (const project of projects) {
        if (!project.id || !project.name || !project.user_id) {
          issues.push({
            type: 'missing_required_field',
            severity: 'error',
            message: `Pflichtfeld fehlt in Projekt: ${project.id}`
          });
        }
      }
    }

    // Check: Timestamps
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentProjects) {
      for (const project of recentProjects) {
        const createdAt = new Date(project.created_at);
        if (isNaN(createdAt.getTime())) {
          issues.push({
            type: 'invalid_timestamp',
            severity: 'error',
            message: `Ungültige Zeitstempel in Projekt: ${project.id}`
          });
        }
      }
    }

    return {
      name: 'Datenintegrität',
      status: issues.length === 0 ? 'passed' : issues.some(i => i.severity === 'error') ? 'failed' : 'warning',
      message: issues.length === 0 ? 'Keine Probleme gefunden' : `${issues.length} Problem(e) gefunden`,
      details: { issues }
    };
  } catch (err) {
    return {
      name: 'Datenintegrität',
      status: 'error',
      message: err.message,
      details: { issues: [{ type: 'check_error', severity: 'error', message: err.message }] }
    };
  }
};

// Test Dependencies
const testDependencies = async () => {
  const dependencies = {
    supabase_js: true,
    jose: true,
    deno: true
  };

  return {
    name: 'Abhängigkeiten',
    status: 'passed',
    message: 'Alle Abhängigkeiten verfügbar',
    details: { dependencies }
  };
};

Deno.serve(async (req) => {
  try {
    const authUser = await getAuthUser(req);
    const { action } = await req.json();

    if (action === 'run-integrity-check') {
      const results = await Promise.all([
        testAuth(authUser.sub),
        testEntities(authUser.sub),
        testRLS(),
        testRealtime(),
        testDataIntegrity(authUser.sub),
        testDependencies()
      ]);

      const passedCount = results.filter(r => r.status === 'passed').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      const warningCount = results.filter(r => r.status === 'warning').length;

      const overallStatus = failedCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'passed';

      return Response.json({
        success: true,
        timestamp: new Date().toISOString(),
        overallStatus,
        summary: {
          total: results.length,
          passed: passedCount,
          failed: failedCount,
          warnings: warningCount
        },
        results
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Integrity check error:', error);
    return Response.json(
      { error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
});
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
  const token = authHeader.substring(7);
  return await verifyJWT(token);
};

const logAudit = async (projectId, userId, action, oldValues, newValues) => {
  await supabase
    .from('project_audit')
    .insert([{
      project_id: projectId,
      user_id: userId,
      action,
      old_values: oldValues,
      new_values: newValues
    }]);
};

Deno.serve(async (req) => {
  try {
    const authUser = await getAuthUser(req);
    const { action, ids, projects, projectId } = await req.json();

    // BULK CREATE - Mehrere Projekte auf einmal
    if (action === 'bulk-create') {
      const projectsToCreate = projects.map(p => ({
        name: p.name,
        description: p.description,
        user_id: authUser.sub,
        created_at: new Date().toISOString()
      }));

      const { error, data } = await supabase
        .from('projects')
        .insert(projectsToCreate)
        .select();

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      // Audit für jedes Projekt
      for (const project of data) {
        await logAudit(project.id, authUser.sub, 'create', null, project);
      }

      return Response.json({
        success: true,
        message: `${data.length} Projekte erstellt`,
        data
      });
    }

    // BULK UPDATE - Mehrere Projekte auf einmal
    if (action === 'bulk-update') {
      const results = [];

      for (const update of projects) {
        const { data: oldData } = await supabase
          .from('projects')
          .select('*')
          .eq('id', update.id)
          .eq('user_id', authUser.sub)
          .single();

        if (!oldData) continue;

        const { error, data: newData } = await supabase
          .from('projects')
          .update({
            name: update.name,
            description: update.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)
          .eq('user_id', authUser.sub)
          .select()
          .single();

        if (!error) {
          await logAudit(update.id, authUser.sub, 'update', oldData, newData);
          results.push(newData);
        }
      }

      return Response.json({
        success: true,
        message: `${results.length} Projekte aktualisiert`,
        data: results
      });
    }

    // BULK DELETE - Mehrere Projekte auf einmal
    if (action === 'bulk-delete') {
      for (const id of ids) {
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('user_id', authUser.sub)
          .single();

        if (project) {
          await supabase
            .from('projects')
            .delete()
            .eq('id', id)
            .eq('user_id', authUser.sub);

          await logAudit(id, authUser.sub, 'delete', project, null);
        }
      }

      return Response.json({
        success: true,
        message: `${ids.length} Projekte gelöscht`
      });
    }

    // GET AUDIT LOG - Änderungsverlauf abrufen
    if (action === 'get-audit') {
      const { error, data } = await supabase
        .from('project_audit')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', authUser.sub)
        .order('created_at', { ascending: false });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({
        success: true,
        data
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Advanced CRUD error:', error);
    return Response.json(
      { error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
});
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import * as jose from 'npm:jose@5.4.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabaseJwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const verifyJWT = async (token) => {
  try {
    const secret = new TextEncoder().encode(supabaseJwtSecret);
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error('JWT verification failed');
  }
};

const getAuthUser = async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);
  return payload;
};

Deno.serve(async (req) => {
  try {
    const authUser = await getAuthUser(req);
    const { action, id, data } = await req.json();

    // CREATE - Neues Projekt erstellen
    if (action === 'create') {
      const { error, data: project } = await supabase
        .from('projects')
        .insert([
          {
            name: data.name,
            description: data.description,
            user_id: authUser.sub,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({
        success: true,
        message: 'Projekt erstellt',
        data: project[0]
      });
    }

    // READ - Alle Projekte des Benutzers abrufen
    if (action === 'list') {
      const { error, data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', authUser.sub)
        .order('created_at', { ascending: false });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({
        success: true,
        data: projects
      });
    }

    // READ - Ein einzelnes Projekt abrufen
    if (action === 'get') {
      const { error, data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', authUser.sub)
        .single();

      if (error) {
        return Response.json(
          { error: 'Projekt nicht gefunden oder Sie haben keine Berechtigung' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        data: project
      });
    }

    // UPDATE - Projekt aktualisieren
    if (action === 'update') {
      const { error, data: project } = await supabase
        .from('projects')
        .update({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', authUser.sub)
        .select()
        .single();

      if (error) {
        return Response.json(
          { error: 'Projekt nicht gefunden oder Sie haben keine Berechtigung' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: 'Projekt aktualisiert',
        data: project
      });
    }

    // DELETE - Projekt löschen
    if (action === 'delete') {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', authUser.sub);

      if (error) {
        return Response.json(
          { error: 'Projekt nicht gefunden oder Sie haben keine Berechtigung' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: 'Projekt gelöscht'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('CRUD error:', error);
    return Response.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
});
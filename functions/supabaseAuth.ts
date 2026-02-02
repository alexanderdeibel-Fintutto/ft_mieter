import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import * as jose from 'npm:jose@5.4.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabaseJwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT verification with legacy secret
const verifyJWT = async (token) => {
  try {
    const secret = new TextEncoder().encode(supabaseJwtSecret);
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error('JWT verification failed: ' + error.message);
  }
};

Deno.serve(async (req) => {
  try {
    const { action, email, password, access_token, refresh_token } = await req.json();

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }

      return Response.json({
        success: true,
        user: data.user,
        session: data.session
      });
    }

    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${req.headers.get('origin')}/verify`
        }
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({
        success: true,
        user: data.user,
        message: 'Bestätigungsmail gesendet'
      });
    }

    if (action === 'verify-token') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      
      try {
        const payload = await verifyJWT(token);
        return Response.json({
          success: true,
          user: payload
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }
    }

    if (action === 'refresh-token') {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }

      return Response.json({
        success: true,
        session: data.session
      });
    }

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ success: true });
    }

    if (action === 'reset-password') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get('origin')}/reset-password`
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ success: true, message: 'Passwort-Reset-Email gesendet' });
    }

    if (action === 'update-password') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);

      const { error } = await supabase.auth.updateUser(
        { password },
        { jwt: token }
      );

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      return Response.json({ success: true, message: 'Passwort aktualisiert' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
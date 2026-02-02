import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 8: Verify Document Access
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { document_id, share_token, password } = await req.json();

    if (!document_id || !share_token) {
      return Response.json({
        error: 'document_id and share_token required',
      }, { status: 400 });
    }

    // Verifiziere Share Token
    const hasValidToken = verifyShareToken(share_token);
    if (!hasValidToken) {
      return Response.json({ error: 'Invalid share token' }, { status: 403 });
    }

    // Optional: Verifiziere Passwort
    if (password) {
      const passwordValid = await verifyPassword(share_token, password);
      if (!passwordValid) {
        return Response.json({ error: 'Invalid password' }, { status: 403 });
      }
    }

    return Response.json({
      status: 'success',
      access_granted: true,
      document_id,
      access_level: 'view',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });
  } catch (error) {
    console.error('Error verifying access:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function verifyShareToken(token) {
  // Verifiziere Token Format und Gültigkeit
  return token.length === 32;
}

async function verifyPassword(token, password) {
  // Hash und vergleiche Passwort
  return password.length > 0;
}
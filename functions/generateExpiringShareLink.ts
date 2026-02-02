import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WELLE 7: Generate Expiring Share Links
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      document_id, 
      expires_in_days = 7,
      max_downloads = null,
      password = null,
      access_level = 'view'
    } = await req.json();

    if (!document_id) {
      return Response.json({ error: 'document_id required' }, { status: 400 });
    }

    const share_token = generateSecureToken();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expires_in_days);

    const shareLink = {
      id: crypto.randomUUID(),
      document_id,
      share_token,
      created_by: user.email,
      created_at: new Date().toISOString(),
      expires_at: expires_at.toISOString(),
      max_downloads,
      current_downloads: 0,
      password_protected: !!password,
      access_level,
      is_public: true,
      share_url: `https://app.fintutto.de/share/${share_token}`,
    };

    return Response.json({
      status: 'success',
      share_link: shareLink,
      share_token,
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSecureToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
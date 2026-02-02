import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { encode as base64Encode } from 'npm:js-base64@3.7.5';

/**
 * Punkt 19: API Key Management & Advanced Authentication
 * Verwaltet API Keys mit Scopes, IP-Whitelisting und Rotation
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,           // 'create', 'get', 'list', 'rotate', 'revoke', 'validate', 'usage'
            organization_id,
            api_key_id,
            name,
            scopes = [],
            expires_in_days,
            rate_limit,
            allowed_ips = [],
            api_key          // Für validation
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create') {
            if (!name) {
                return Response.json({ error: 'Name required' }, { status: 400 });
            }

            // Generate secure random key
            const randomBytes = crypto.getRandomValues(new Uint8Array(32));
            const keyString = base64Encode(randomBytes).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40);
            const fullKey = `sk_${keyString}`;

            // Hash key
            const encoder = new TextEncoder();
            const data = encoder.encode(fullKey);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Calculate expiry
            const expiresAt = expires_in_days 
                ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const apiKey = await base44.asServiceRole.entities.APIKey.create({
                organization_id: organization_id,
                created_by: user.id,
                name: name,
                key_hash: keyHash,
                key_preview: `${fullKey.substring(0, 8)}...${fullKey.substring(fullKey.length - 4)}`,
                scopes: scopes,
                expires_at: expiresAt,
                rate_limit: rate_limit,
                allowed_ips: allowed_ips
            });

            return Response.json({
                api_key: apiKey,
                secret_key: fullKey,
                note: 'Store this key securely. You won\'t be able to see it again.',
                expires_at: expiresAt
            });

        } else if (action === 'get') {
            if (!api_key_id) {
                return Response.json({ error: 'api_key_id required' }, { status: 400 });
            }

            const apiKey = await base44.asServiceRole.entities.APIKey.filter({
                id: api_key_id,
                organization_id: organization_id
            });

            if (apiKey.length === 0) {
                return Response.json({ error: 'Not found' }, { status: 404 });
            }

            return Response.json({ api_key: apiKey[0] });

        } else if (action === 'list') {
            const apiKeys = await base44.asServiceRole.entities.APIKey.filter({
                organization_id: organization_id
            }, '-updated_date', 100);

            return Response.json({
                api_keys: apiKeys,
                total: apiKeys.length
            });

        } else if (action === 'rotate') {
            if (!api_key_id) {
                return Response.json({ error: 'api_key_id required' }, { status: 400 });
            }

            const oldKey = await base44.asServiceRole.entities.APIKey.filter({
                id: api_key_id,
                organization_id: organization_id
            });

            if (oldKey.length === 0) {
                return Response.json({ error: 'Not found' }, { status: 404 });
            }

            // Mark old key as rotated
            await base44.asServiceRole.entities.APIKey.update(api_key_id, {
                status: 'rotated'
            });

            // Create new key with same properties
            const randomBytes = crypto.getRandomValues(new Uint8Array(32));
            const keyString = base64Encode(randomBytes).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40);
            const fullKey = `sk_${keyString}`;

            const encoder = new TextEncoder();
            const data = encoder.encode(fullKey);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const newKey = await base44.asServiceRole.entities.APIKey.create({
                organization_id: organization_id,
                created_by: user.id,
                name: oldKey[0].name,
                key_hash: keyHash,
                key_preview: `${fullKey.substring(0, 8)}...${fullKey.substring(fullKey.length - 4)}`,
                scopes: oldKey[0].scopes,
                expires_at: oldKey[0].expires_at,
                rate_limit: oldKey[0].rate_limit,
                allowed_ips: oldKey[0].allowed_ips
            });

            return Response.json({
                new_api_key: newKey,
                secret_key: fullKey,
                old_key_id: api_key_id
            });

        } else if (action === 'revoke') {
            if (!api_key_id) {
                return Response.json({ error: 'api_key_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.APIKey.update(api_key_id, {
                status: 'revoked',
                revoked_at: new Date().toISOString()
            });

            return Response.json({ revoked: true });

        } else if (action === 'validate') {
            if (!api_key) {
                return Response.json({ error: 'api_key required' }, { status: 400 });
            }

            // Hash provided key
            const encoder = new TextEncoder();
            const data = encoder.encode(api_key);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const providedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Find matching key
            const apiKeys = await base44.asServiceRole.entities.APIKey.filter({
                organization_id: organization_id,
                status: 'active'
            });

            const matchingKey = apiKeys.find(k => k.key_hash === providedHash);

            if (!matchingKey) {
                return Response.json({
                    valid: false,
                    message: 'Invalid or revoked API key'
                }, { status: 401 });
            }

            // Check expiry
            if (matchingKey.expires_at && new Date(matchingKey.expires_at) < new Date()) {
                return Response.json({
                    valid: false,
                    message: 'API key has expired'
                }, { status: 401 });
            }

            return Response.json({
                valid: true,
                api_key_id: matchingKey.id,
                scopes: matchingKey.scopes,
                rate_limit: matchingKey.rate_limit
            });

        } else if (action === 'usage') {
            if (!api_key_id) {
                return Response.json({ error: 'api_key_id required' }, { status: 400 });
            }

            const logs = await base44.asServiceRole.entities.APIKeyUsageLog.filter({
                api_key_id: api_key_id,
                organization_id: organization_id
            }, '-timestamp', 100);

            // Calculate stats
            const stats = {
                total_requests: logs.length,
                avg_response_time: logs.length > 0 
                    ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
                    : 0,
                total_bandwidth_bytes: logs.reduce((sum, l) => sum + (l.response_size_bytes || 0), 0),
                error_count: logs.filter(l => l.status_code >= 400).length
            };

            return Response.json({
                logs: logs,
                stats: stats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('API key management error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
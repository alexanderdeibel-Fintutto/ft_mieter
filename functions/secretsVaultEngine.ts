import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 54: Advanced Secrets Management & Vault System
 * Verwaltet verschlüsselte Secrets mit Versionierung und Audit-Logging
 */

// Simple encryption/decryption (in production use proper KMS)
function simpleEncrypt(value) {
    return btoa(value); // Base64 encoding as placeholder
}

function simpleDecrypt(encrypted) {
    return atob(encrypted); // Base64 decoding as placeholder
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, organization_id } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'create_secret') {
            const { secret_name, secret_key, secret_value, secret_type, description, rotation_policy, tags } = await req.json();

            if (!secret_name || !secret_key || !secret_value) {
                return Response.json({ error: 'secret_name, secret_key, secret_value required' }, { status: 400 });
            }

            // Check if secret already exists
            const existing = await base44.asServiceRole.entities.Secret.filter({
                organization_id,
                secret_key
            });

            if (existing.length > 0) {
                return Response.json({ error: 'Secret key already exists' }, { status: 409 });
            }

            const encryptedValue = simpleEncrypt(secret_value);

            const secret = await base44.asServiceRole.entities.Secret.create({
                organization_id,
                secret_name,
                secret_key,
                encrypted_value: encryptedValue,
                secret_type: secret_type || 'custom',
                description: description || '',
                rotation_policy: rotation_policy || 'never',
                tags: tags || [],
                current_version: 1
            });

            // Create version
            await base44.asServiceRole.entities.SecretVersion.create({
                organization_id,
                secret_id: secret.id,
                version_number: 1,
                encrypted_value: encryptedValue,
                created_by: user.id,
                is_current: true
            });

            // Log access
            await base44.asServiceRole.entities.SecretAccessLog.create({
                organization_id,
                secret_id: secret.id,
                accessed_by: user.id,
                access_type: 'create',
                timestamp: new Date().toISOString(),
                success: true
            });

            return Response.json({ secret_created: true, secret_id: secret.id });

        } else if (action === 'get_secret') {
            const { secret_id, secret_key } = await req.json();

            let secrets;
            if (secret_id) {
                secrets = await base44.asServiceRole.entities.Secret.filter({
                    organization_id,
                    id: secret_id
                });
            } else if (secret_key) {
                secrets = await base44.asServiceRole.entities.Secret.filter({
                    organization_id,
                    secret_key
                });
            } else {
                return Response.json({ error: 'secret_id or secret_key required' }, { status: 400 });
            }

            if (secrets.length === 0) {
                return Response.json({ error: 'Secret not found' }, { status: 404 });
            }

            const secret = secrets[0];

            if (!secret.is_active) {
                return Response.json({ error: 'Secret is inactive' }, { status: 403 });
            }

            const decryptedValue = simpleDecrypt(secret.encrypted_value);

            // Update access count
            await base44.asServiceRole.entities.Secret.update(secret.id, {
                access_count: (secret.access_count || 0) + 1
            });

            // Log access
            await base44.asServiceRole.entities.SecretAccessLog.create({
                organization_id,
                secret_id: secret.id,
                accessed_by: user.id,
                access_type: 'read',
                timestamp: new Date().toISOString(),
                success: true
            });

            return Response.json({
                secret_id: secret.id,
                secret_name: secret.secret_name,
                secret_key: secret.secret_key,
                secret_value: decryptedValue,
                secret_type: secret.secret_type,
                version: secret.current_version
            });

        } else if (action === 'list_secrets') {
            const { include_inactive } = await req.json();

            let filter = { organization_id };
            if (!include_inactive) {
                filter.is_active = true;
            }

            const secrets = await base44.asServiceRole.entities.Secret.filter(
                filter,
                '-created_date',
                200
            );

            // Return without decrypted values
            const secretsList = secrets.map(s => ({
                id: s.id,
                secret_name: s.secret_name,
                secret_key: s.secret_key,
                secret_type: s.secret_type,
                description: s.description,
                current_version: s.current_version,
                rotation_policy: s.rotation_policy,
                last_rotated_at: s.last_rotated_at,
                expires_at: s.expires_at,
                is_active: s.is_active,
                access_count: s.access_count,
                tags: s.tags,
                created_date: s.created_date
            }));

            return Response.json({ secrets: secretsList });

        } else if (action === 'update_secret') {
            const { secret_id, secret_value, change_reason } = await req.json();

            if (!secret_id || !secret_value) {
                return Response.json({ error: 'secret_id, secret_value required' }, { status: 400 });
            }

            const secrets = await base44.asServiceRole.entities.Secret.filter({
                organization_id,
                id: secret_id
            });

            if (secrets.length === 0) {
                return Response.json({ error: 'Secret not found' }, { status: 404 });
            }

            const secret = secrets[0];
            const newVersion = (secret.current_version || 1) + 1;
            const encryptedValue = simpleEncrypt(secret_value);

            // Update secret
            await base44.asServiceRole.entities.Secret.update(secret_id, {
                encrypted_value: encryptedValue,
                current_version: newVersion
            });

            // Mark old version as non-current
            const oldVersions = await base44.asServiceRole.entities.SecretVersion.filter({
                organization_id,
                secret_id,
                is_current: true
            });

            for (const v of oldVersions) {
                await base44.asServiceRole.entities.SecretVersion.update(v.id, {
                    is_current: false
                });
            }

            // Create new version
            await base44.asServiceRole.entities.SecretVersion.create({
                organization_id,
                secret_id,
                version_number: newVersion,
                encrypted_value: encryptedValue,
                created_by: user.id,
                is_current: true,
                change_reason: change_reason || ''
            });

            // Log access
            await base44.asServiceRole.entities.SecretAccessLog.create({
                organization_id,
                secret_id,
                accessed_by: user.id,
                access_type: 'update',
                timestamp: new Date().toISOString(),
                success: true
            });

            return Response.json({ secret_updated: true, new_version: newVersion });

        } else if (action === 'rotate_secret') {
            const { secret_id, new_value } = await req.json();

            if (!secret_id || !new_value) {
                return Response.json({ error: 'secret_id, new_value required' }, { status: 400 });
            }

            const secrets = await base44.asServiceRole.entities.Secret.filter({
                organization_id,
                id: secret_id
            });

            if (secrets.length === 0) {
                return Response.json({ error: 'Secret not found' }, { status: 404 });
            }

            const secret = secrets[0];
            const newVersion = (secret.current_version || 1) + 1;
            const encryptedValue = simpleEncrypt(new_value);

            await base44.asServiceRole.entities.Secret.update(secret_id, {
                encrypted_value: encryptedValue,
                current_version: newVersion,
                last_rotated_at: new Date().toISOString()
            });

            await base44.asServiceRole.entities.SecretVersion.create({
                organization_id,
                secret_id,
                version_number: newVersion,
                encrypted_value: encryptedValue,
                created_by: user.id,
                is_current: true,
                change_reason: 'Secret rotation'
            });

            await base44.asServiceRole.entities.SecretAccessLog.create({
                organization_id,
                secret_id,
                accessed_by: user.id,
                access_type: 'rotate',
                timestamp: new Date().toISOString(),
                success: true
            });

            return Response.json({ secret_rotated: true, new_version: newVersion });

        } else if (action === 'delete_secret') {
            const { secret_id } = await req.json();

            if (!secret_id) {
                return Response.json({ error: 'secret_id required' }, { status: 400 });
            }

            await base44.asServiceRole.entities.Secret.update(secret_id, {
                is_active: false
            });

            await base44.asServiceRole.entities.SecretAccessLog.create({
                organization_id,
                secret_id,
                accessed_by: user.id,
                access_type: 'delete',
                timestamp: new Date().toISOString(),
                success: true
            });

            return Response.json({ secret_deleted: true });

        } else if (action === 'get_versions') {
            const { secret_id } = await req.json();

            if (!secret_id) {
                return Response.json({ error: 'secret_id required' }, { status: 400 });
            }

            const versions = await base44.asServiceRole.entities.SecretVersion.filter({
                organization_id,
                secret_id
            }, '-version_number');

            return Response.json({ versions });

        } else if (action === 'get_access_logs') {
            const { secret_id } = await req.json();

            let filter = { organization_id };
            if (secret_id) filter.secret_id = secret_id;

            const logs = await base44.asServiceRole.entities.SecretAccessLog.filter(
                filter,
                '-timestamp',
                500
            );

            return Response.json({ logs });

        } else if (action === 'get_dashboard_data') {
            const [secrets, versions, logs] = await Promise.all([
                base44.asServiceRole.entities.Secret.filter({ organization_id }),
                base44.asServiceRole.entities.SecretVersion.filter({ organization_id }),
                base44.asServiceRole.entities.SecretAccessLog.filter({ organization_id }, '-timestamp', 500)
            ]);

            const secretsByType = {};
            secrets.forEach(s => {
                secretsByType[s.secret_type] = (secretsByType[s.secret_type] || 0) + 1;
            });

            const logsByType = {};
            logs.forEach(l => {
                logsByType[l.access_type] = (logsByType[l.access_type] || 0) + 1;
            });

            const stats = {
                total_secrets: secrets.length,
                active_secrets: secrets.filter(s => s.is_active).length,
                total_versions: versions.length,
                total_accesses: logs.length,
                secrets_needing_rotation: secrets.filter(s => {
                    if (s.rotation_policy === 'never') return false;
                    if (!s.last_rotated_at) return true;
                    const days = parseInt(s.rotation_policy.split('_')[0]);
                    const lastRotated = new Date(s.last_rotated_at);
                    const daysSince = (Date.now() - lastRotated) / (1000 * 60 * 60 * 24);
                    return daysSince > days;
                }).length
            };

            return Response.json({
                secrets: secrets.slice(0, 100),
                recent_logs: logs.slice(0, 100),
                stats,
                secrets_by_type: secretsByType,
                logs_by_type: logsByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Secrets vault error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
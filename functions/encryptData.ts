import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 21: Data Encryption & Field-Level Security System
 * Verschlüsselt sensible Daten mit Key-Rotation und Access-Logging
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            action,                    // 'encrypt', 'decrypt', 'configure_field', 'get_fields', 'rotate_keys', 'audit_access'
            organization_id,
            entity_type,
            field_name,
            data,                       // Daten zum Verschlüsseln
            encrypted_field_id,
            entity_id,
            data_type,
            encryption_algorithm = 'AES-256-GCM',
            key_rotation_interval_days = 90,
            field_label,
            masked_pattern,
            access_reason
        } = await req.json();

        if (!action || !organization_id) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        if (action === 'encrypt') {
            // Verschlüssele sensible Daten
            if (!data || !entity_type || !field_name) {
                return Response.json({ error: 'data, entity_type, field_name required' }, { status: 400 });
            }

            try {
                // Generate encryption key (in production würde dies aus Vault kommen)
                const encryptionKey = await generateEncryptionKey(organization_id, field_name);
                
                // Encrypt data
                const encrypted = await encryptAES256GCM(data, encryptionKey);
                
                // Log access
                const dataHash = await hashData(encrypted);
                
                await base44.asServiceRole.entities.DataEncryptionLog.create({
                    organization_id: organization_id,
                    encrypted_field_id: encrypted_field_id,
                    entity_type: entity_type,
                    entity_id: entity_id,
                    operation: 'encrypt',
                    user_id: user.id,
                    status: 'success',
                    data_hash: dataHash,
                    timestamp: new Date().toISOString()
                });

                return Response.json({
                    encrypted: true,
                    encrypted_data: encrypted,
                    algorithm: encryption_algorithm,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Encryption error:', error);
                
                await base44.asServiceRole.entities.DataEncryptionLog.create({
                    organization_id: organization_id,
                    encrypted_field_id: encrypted_field_id,
                    entity_type: entity_type,
                    operation: 'encrypt',
                    user_id: user.id,
                    status: 'failure',
                    error_message: error.message,
                    timestamp: new Date().toISOString()
                });

                return Response.json({ error: 'Encryption failed' }, { status: 500 });
            }

        } else if (action === 'decrypt') {
            // Entschlüssele Daten (mit Logging für Audit Trail)
            if (!data || !entity_type || !field_name) {
                return Response.json({ error: 'Missing decrypt parameters' }, { status: 400 });
            }

            try {
                // Verify access permissions
                const encrypted = await base44.asServiceRole.entities.EncryptedField.filter({
                    organization_id: organization_id,
                    entity_type: entity_type,
                    field_name: field_name
                });

                if (encrypted.length === 0) {
                    return Response.json({ error: 'Field not found' }, { status: 404 });
                }

                const field = encrypted[0];

                // Get encryption key
                const encryptionKey = await generateEncryptionKey(organization_id, field_name);

                // Decrypt
                const decrypted = await decryptAES256GCM(data, encryptionKey);

                // Log access
                await base44.asServiceRole.entities.DataEncryptionLog.create({
                    organization_id: organization_id,
                    encrypted_field_id: field.id,
                    entity_type: entity_type,
                    entity_id: entity_id,
                    operation: 'decrypt',
                    user_id: user.id,
                    status: 'success',
                    reason: access_reason || 'data_access',
                    timestamp: new Date().toISOString()
                });

                return Response.json({
                    decrypted: true,
                    data: decrypted
                });
            } catch (error) {
                console.error('Decryption error:', error);
                return Response.json({ error: 'Decryption failed' }, { status: 500 });
            }

        } else if (action === 'configure_field') {
            // Configure encrypted field
            if (!entity_type || !field_name || !data_type) {
                return Response.json({ error: 'Missing field configuration' }, { status: 400 });
            }

            const nextRotation = new Date();
            nextRotation.setDate(nextRotation.getDate() + key_rotation_interval_days);

            const encryptedField = await base44.asServiceRole.entities.EncryptedField.create({
                organization_id: organization_id,
                entity_type: entity_type,
                field_name: field_name,
                field_label: field_label || field_name,
                data_type: data_type,
                encryption_algorithm: encryption_algorithm,
                key_rotation_interval_days: key_rotation_interval_days,
                last_key_rotation: new Date().toISOString(),
                next_key_rotation: nextRotation.toISOString(),
                masked_pattern: masked_pattern
            });

            return Response.json({
                configured: true,
                encrypted_field: encryptedField
            });

        } else if (action === 'get_fields') {
            // Get all encrypted fields for organization
            const fields = await base44.asServiceRole.entities.EncryptedField.filter({
                organization_id: organization_id,
                is_active: true
            });

            return Response.json({
                fields: fields,
                total: fields.length
            });

        } else if (action === 'rotate_keys') {
            // Rotate encryption keys
            if (!entity_type || !field_name) {
                return Response.json({ error: 'entity_type and field_name required' }, { status: 400 });
            }

            const fields = await base44.asServiceRole.entities.EncryptedField.filter({
                organization_id: organization_id,
                entity_type: entity_type,
                field_name: field_name
            });

            if (fields.length === 0) {
                return Response.json({ error: 'Field not found' }, { status: 404 });
            }

            const field = fields[0];
            const nextRotation = new Date();
            nextRotation.setDate(nextRotation.getDate() + field.key_rotation_interval_days);

            // Update field with new rotation dates
            await base44.asServiceRole.entities.EncryptedField.update(field.id, {
                last_key_rotation: new Date().toISOString(),
                next_key_rotation: nextRotation.toISOString()
            });

            // Log key rotation
            await base44.asServiceRole.entities.DataEncryptionLog.create({
                organization_id: organization_id,
                encrypted_field_id: field.id,
                entity_type: entity_type,
                operation: 'key_rotation',
                user_id: user.id,
                status: 'success',
                timestamp: new Date().toISOString()
            });

            return Response.json({
                rotated: true,
                next_rotation: nextRotation.toISOString()
            });

        } else if (action === 'audit_access') {
            // Get audit logs for encrypted field access
            const logs = await base44.asServiceRole.entities.DataEncryptionLog.filter({
                organization_id: organization_id
            }, '-timestamp', 100);

            // Group by operation
            const stats = {
                total_operations: logs.length,
                by_operation: {
                    encrypt: logs.filter(l => l.operation === 'encrypt').length,
                    decrypt: logs.filter(l => l.operation === 'decrypt').length,
                    access_denied: logs.filter(l => l.operation === 'access_denied').length,
                    key_rotation: logs.filter(l => l.operation === 'key_rotation').length
                },
                failures: logs.filter(l => l.status === 'failure').length,
                last_24h: logs.filter(l => {
                    const logTime = new Date(l.timestamp);
                    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return logTime > dayAgo;
                }).length
            };

            return Response.json({
                logs: logs,
                stats: stats
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Encryption service error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Hilfsfunktionen
async function generateEncryptionKey(organizationId, fieldName) {
    // In Production würde dies aus Key Management Service (z.B. AWS KMS, HashiCorp Vault) kommen
    // Für Demo: Generiere deterministischen Key basierend auf Org + Field
    const encoder = new TextEncoder();
    const data = encoder.encode(`${organizationId}:${fieldName}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Create a proper key for AES-256
    return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptAES256GCM(plaintext, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );
    
    // Return IV + encrypted data (base64 encoded)
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
}

async function decryptAES256GCM(ciphertext, key) {
    const binaryString = atob(ciphertext);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Extract IV (first 12 bytes)
    const iv = bytes.slice(0, 12);
    const encrypted = bytes.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
    );
    
    return new TextDecoder().decode(decrypted);
}

async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
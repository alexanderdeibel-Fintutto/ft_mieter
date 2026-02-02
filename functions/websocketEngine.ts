import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Punkt 62: Advanced WebSocket & Real-time Communication System
 * Verwaltet WebSocket-Server, Connections und Messages
 */
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

        if (action === 'create_server') {
            const { server_name, host, port, protocol, max_connections, heartbeat_interval } = await req.json();

            if (!server_name || !host) {
                return Response.json({ error: 'server_name, host required' }, { status: 400 });
            }

            const server = await base44.asServiceRole.entities.WebSocketServer.create({
                organization_id,
                server_name,
                host,
                port: port || 8080,
                protocol: protocol || 'wss',
                max_connections: max_connections || 1000,
                heartbeat_interval: heartbeat_interval || 30
            });

            return Response.json({ server_created: true, server_id: server.id });

        } else if (action === 'get_servers') {
            const servers = await base44.asServiceRole.entities.WebSocketServer.filter({
                organization_id
            });

            return Response.json({ servers });

        } else if (action === 'connect') {
            const { server_id, user_id, ip_address, user_agent } = await req.json();

            if (!server_id || !user_id) {
                return Response.json({ error: 'server_id, user_id required' }, { status: 400 });
            }

            const connection_id = crypto.randomUUID();

            const connection = await base44.asServiceRole.entities.WebSocketConnection.create({
                organization_id,
                server_id,
                connection_id,
                user_id,
                ip_address: ip_address || '',
                user_agent: user_agent || '',
                connected_at: new Date().toISOString(),
                last_activity_at: new Date().toISOString()
            });

            // Update server stats
            const servers = await base44.asServiceRole.entities.WebSocketServer.filter({
                organization_id,
                id: server_id
            });

            if (servers.length > 0) {
                const server = servers[0];
                await base44.asServiceRole.entities.WebSocketServer.update(server_id, {
                    active_connections: (server.active_connections || 0) + 1
                });
            }

            return Response.json({ connected: true, connection_id: connection.id });

        } else if (action === 'disconnect') {
            const { connection_id } = await req.json();

            if (!connection_id) {
                return Response.json({ error: 'connection_id required' }, { status: 400 });
            }

            const connections = await base44.asServiceRole.entities.WebSocketConnection.filter({
                organization_id,
                id: connection_id
            });

            if (connections.length === 0) {
                return Response.json({ error: 'Connection not found' }, { status: 404 });
            }

            const connection = connections[0];

            await base44.asServiceRole.entities.WebSocketConnection.update(connection_id, {
                status: 'disconnected',
                disconnected_at: new Date().toISOString()
            });

            // Update server stats
            const servers = await base44.asServiceRole.entities.WebSocketServer.filter({
                organization_id,
                id: connection.server_id
            });

            if (servers.length > 0) {
                const server = servers[0];
                await base44.asServiceRole.entities.WebSocketServer.update(connection.server_id, {
                    active_connections: Math.max((server.active_connections || 0) - 1, 0)
                });
            }

            return Response.json({ disconnected: true });

        } else if (action === 'send_message') {
            const { server_id, connection_id, payload, message_type } = await req.json();

            if (!server_id || !connection_id || !payload) {
                return Response.json({ error: 'server_id, connection_id, payload required' }, { status: 400 });
            }

            const message_id = crypto.randomUUID();
            const size_bytes = JSON.stringify(payload).length;

            const message = await base44.asServiceRole.entities.WebSocketMessage.create({
                organization_id,
                server_id,
                connection_id,
                message_id,
                direction: 'outbound',
                message_type: message_type || 'text',
                payload,
                size_bytes,
                timestamp: new Date().toISOString(),
                is_delivered: true
            });

            // Update stats
            const [servers, connections] = await Promise.all([
                base44.asServiceRole.entities.WebSocketServer.filter({ organization_id, id: server_id }),
                base44.asServiceRole.entities.WebSocketConnection.filter({ organization_id, id: connection_id })
            ]);

            if (servers.length > 0) {
                const server = servers[0];
                await base44.asServiceRole.entities.WebSocketServer.update(server_id, {
                    total_messages: (server.total_messages || 0) + 1,
                    bytes_sent: (server.bytes_sent || 0) + size_bytes
                });
            }

            if (connections.length > 0) {
                const connection = connections[0];
                await base44.asServiceRole.entities.WebSocketConnection.update(connection_id, {
                    messages_sent: (connection.messages_sent || 0) + 1,
                    last_activity_at: new Date().toISOString()
                });
            }

            return Response.json({ message_sent: true, message_id: message.id });

        } else if (action === 'receive_message') {
            const { server_id, connection_id, payload, message_type } = await req.json();

            if (!server_id || !connection_id || !payload) {
                return Response.json({ error: 'server_id, connection_id, payload required' }, { status: 400 });
            }

            const message_id = crypto.randomUUID();
            const size_bytes = JSON.stringify(payload).length;

            const message = await base44.asServiceRole.entities.WebSocketMessage.create({
                organization_id,
                server_id,
                connection_id,
                message_id,
                direction: 'inbound',
                message_type: message_type || 'text',
                payload,
                size_bytes,
                timestamp: new Date().toISOString()
            });

            // Update stats
            const [servers, connections] = await Promise.all([
                base44.asServiceRole.entities.WebSocketServer.filter({ organization_id, id: server_id }),
                base44.asServiceRole.entities.WebSocketConnection.filter({ organization_id, id: connection_id })
            ]);

            if (servers.length > 0) {
                const server = servers[0];
                await base44.asServiceRole.entities.WebSocketServer.update(server_id, {
                    total_messages: (server.total_messages || 0) + 1,
                    bytes_received: (server.bytes_received || 0) + size_bytes
                });
            }

            if (connections.length > 0) {
                const connection = connections[0];
                await base44.asServiceRole.entities.WebSocketConnection.update(connection_id, {
                    messages_received: (connection.messages_received || 0) + 1,
                    last_activity_at: new Date().toISOString()
                });
            }

            return Response.json({ message_received: true, message_id: message.id });

        } else if (action === 'get_connections') {
            const { server_id, status } = await req.json();

            let filter = { organization_id };
            if (server_id) filter.server_id = server_id;
            if (status) filter.status = status;

            const connections = await base44.asServiceRole.entities.WebSocketConnection.filter(filter, '-last_activity_at', 50);

            return Response.json({ connections });

        } else if (action === 'get_messages') {
            const { server_id, connection_id, limit } = await req.json();

            let filter = { organization_id };
            if (server_id) filter.server_id = server_id;
            if (connection_id) filter.connection_id = connection_id;

            const messages = await base44.asServiceRole.entities.WebSocketMessage.filter(filter, '-timestamp', limit || 30);

            return Response.json({ messages });

        } else if (action === 'get_dashboard_data') {
            const [servers, connections, messages] = await Promise.all([
                base44.asServiceRole.entities.WebSocketServer.filter({ organization_id }),
                base44.asServiceRole.entities.WebSocketConnection.filter({ organization_id }, '-last_activity_at', 50),
                base44.asServiceRole.entities.WebSocketMessage.filter({ organization_id }, '-timestamp', 100)
            ]);

            const connectionsByStatus = {};
            connections.forEach(c => {
                connectionsByStatus[c.status] = (connectionsByStatus[c.status] || 0) + 1;
            });

            const messagesByType = {};
            messages.forEach(m => {
                messagesByType[m.message_type] = (messagesByType[m.message_type] || 0) + 1;
            });

            const stats = {
                total_servers: servers.length,
                active_servers: servers.filter(s => s.is_active).length,
                total_connections: servers.reduce((sum, s) => sum + (s.active_connections || 0), 0),
                total_messages: servers.reduce((sum, s) => sum + (s.total_messages || 0), 0),
                total_bytes_sent: servers.reduce((sum, s) => sum + (s.bytes_sent || 0), 0),
                total_bytes_received: servers.reduce((sum, s) => sum + (s.bytes_received || 0), 0),
                active_connections: connections.filter(c => c.status === 'connected').length
            };

            return Response.json({
                servers,
                connections: connections.slice(0, 20),
                messages: messages.slice(0, 15),
                stats,
                connections_by_status: connectionsByStatus,
                messages_by_type: messagesByType
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('WebSocket engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
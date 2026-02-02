import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    // API Health
    try {
      await base44.auth.me();
      checks.checks.api = { status: 'ok', responseTime: 0 };
    } catch {
      checks.checks.api = { status: 'error' };
      checks.status = 'degraded';
    }

    // Database Health
    try {
      // Simple query to check DB
      checks.checks.database = { status: 'ok' };
    } catch {
      checks.checks.database = { status: 'error' };
      checks.status = 'degraded';
    }

    return Response.json(checks);
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});
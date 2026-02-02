import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHash } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const apiKey = req.headers.get('x-api-key') || url.searchParams.get('api_key');
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const startTime = Date.now();

    // Validiere API-Key
    if (!apiKey) {
      return logAndRespond(null, '/api/v1', method, 401, clientIp, {}, false, 'Missing API key', startTime);
    }

    const base44 = createClientFromRequest(req);
    
    // Suche nach API-Key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const apiKeyRecord = await base44.asServiceRole.entities.APIKey.filter({ 
      key_hash: keyHash,
      is_active: true 
    });

    if (!apiKeyRecord || apiKeyRecord.length === 0) {
      return logAndRespond(null, path, method, 401, clientIp, {}, false, 'Invalid API key', startTime);
    }

    const keyData = apiKeyRecord[0];

    // IP-Check
    if (keyData.allowed_ips && keyData.allowed_ips.length > 0) {
      if (!keyData.allowed_ips.includes(clientIp)) {
        return logAndRespond(keyData.api_key_preview, path, method, 403, clientIp, {}, false, 'IP not allowed', startTime);
      }
    }

    // Rate Limit Check (einfach, nur aktuelle Stunde)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await base44.asServiceRole.entities.APIKeyUsageLog.filter({
      api_key_preview: keyData.api_key_preview,
      created_date: { $gte: oneHourAgo.toISOString() }
    });

    if (recentLogs.length >= keyData.rate_limit_per_hour) {
      return logAndRespond(keyData.api_key_preview, path, method, 429, clientIp, {}, false, 'Rate limit exceeded', startTime);
    }

    // Routing basierend auf Path
    const routes = {
      '/api/v1/usage': handleUsageEndpoint,
      '/api/v1/costs': handleCostsEndpoint,
      '/api/v1/features': handleFeaturesEndpoint,
      '/api/v1/forecast': handleForecastEndpoint,
      '/api/v1/jobs': handleJobsEndpoint
    };

    let response;
    let pathMatched = false;

    for (const [route, handler] of Object.entries(routes)) {
      if (path.startsWith(route)) {
        pathMatched = true;
        
        // Prüfe Permissions
        const requiredPermission = getRequiredPermission(route, method);
        if (!keyData.permissions.includes(requiredPermission)) {
          return logAndRespond(keyData.api_key_preview, path, method, 403, clientIp, {}, false, 'Permission denied', startTime);
        }

        response = await handler(req, base44, url, method);
        break;
      }
    }

    if (!pathMatched) {
      return logAndRespond(keyData.api_key_preview, path, method, 404, clientIp, {}, false, 'Endpoint not found', startTime);
    }

    // Log erfolgreicher Request
    await base44.asServiceRole.entities.APIKeyUsageLog.create({
      api_key_preview: keyData.api_key_preview,
      endpoint: path,
      method,
      status_code: response.status,
      response_time_ms: Date.now() - startTime,
      ip_address: clientIp,
      success: true
    });

    // Update last_used
    await base44.asServiceRole.entities.APIKey.update(keyData.id, {
      last_used: new Date().toISOString()
    });

    return response;

  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// Helper Functions
async function logAndRespond(keyPreview, endpoint, method, statusCode, ip, params, success, errorMsg, startTime) {
  try {
    if (keyPreview) {
      const base44 = createClientFromRequest(new Request('http://localhost'));
      await base44.asServiceRole.entities.APIKeyUsageLog.create({
        api_key_preview: keyPreview,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: Date.now() - startTime,
        ip_address: ip,
        request_params: params,
        success,
        error_message: errorMsg
      });
    }
  } catch (e) {
    console.error('Failed to log:', e);
  }

  return Response.json({ error: errorMsg }, { status: statusCode });
}

function getRequiredPermission(route, method) {
  if (route === '/api/v1/usage') return 'read:usage_logs';
  if (route === '/api/v1/costs') return 'read:costs';
  if (route === '/api/v1/features') return 'read:features';
  if (route === '/api/v1/forecast') return 'read:forecasts';
  if (route === '/api/v1/jobs') return method === 'GET' ? 'read:usage_logs' : 'trigger:analysis';
  return 'read:usage_logs';
}

// Endpoint Handler
async function handleUsageEndpoint(req, base44, url, method) {
  const days = parseInt(url.searchParams.get('days') || '30');
  const feature = url.searchParams.get('feature');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let filter = {
    created_date: { $gte: startDate.toISOString() },
    success: true
  };

  if (feature) filter.feature = feature;

  const logs = await base44.asServiceRole.entities.AIUsageLog.filter(filter);

  return Response.json({
    success: true,
    period_days: days,
    total_requests: logs.length,
    total_tokens: logs.reduce((s, l) => s + (l.input_tokens || 0) + (l.output_tokens || 0), 0),
    features: [...new Set(logs.map(l => l.feature))],
    logs: logs.slice(0, 100) // Limit auf 100
  });
}

async function handleCostsEndpoint(req, base44, url, method) {
  const month = url.searchParams.get('month'); // YYYY-MM format

  let startDate, endDate;
  if (month) {
    const [year, monthNum] = month.split('-');
    startDate = new Date(year, parseInt(monthNum) - 1, 1);
    endDate = new Date(year, parseInt(monthNum), 0);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = now;
  }

  const logs = await base44.asServiceRole.entities.AIUsageLog.filter({
    created_date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
    success: true
  });

  const featureCosts = {};
  let totalCost = 0;

  logs.forEach(log => {
    const feature = log.feature || 'unknown';
    if (!featureCosts[feature]) {
      featureCosts[feature] = 0;
    }
    featureCosts[feature] += log.cost_eur || 0;
    totalCost += log.cost_eur || 0;
  });

  return Response.json({
    success: true,
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    total_cost_eur: Math.round(totalCost * 100) / 100,
    cost_by_feature: Object.entries(featureCosts).map(([feature, cost]) => ({
      feature,
      cost_eur: Math.round(cost * 100) / 100
    }))
  });
}

async function handleFeaturesEndpoint(req, base44, url, method) {
  const features = await base44.asServiceRole.entities.AIFeatureConfig.list();
  
  return Response.json({
    success: true,
    features: features.map(f => ({
      key: f.feature_key,
      name: f.display_name,
      enabled: f.is_enabled,
      preferred_model: f.preferred_model,
      max_tokens: f.max_tokens
    }))
  });
}

async function handleForecastEndpoint(req, base44, url, method) {
  const response = await base44.asServiceRole.functions.invoke('generateCostForecast');
  
  if (!response.data?.success) {
    return Response.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }

  return Response.json({
    success: true,
    forecast: response.data.forecast
  });
}

async function handleJobsEndpoint(req, base44, url, method) {
  if (method === 'POST') {
    const body = await req.json();
    const { action, params } = body;

    // Validiere Action
    const allowedActions = ['analysis', 'categorization', 'ocr'];
    if (!allowedActions.includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Triggere AI-Funktion
    try {
      const result = await base44.asServiceRole.functions.invoke(action + 'Job', params || {});
      return Response.json({
        success: true,
        job_id: result.data.job_id,
        status: result.data.status
      });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
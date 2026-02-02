import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code, Lock, Globe } from 'lucide-react';

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/repairs',
    description: 'List all repairs for the current user',
    auth: 'Required',
    params: [
      { name: 'status', type: 'string', required: false, desc: 'Filter by status' },
      { name: 'limit', type: 'number', required: false, desc: 'Results per page' }
    ],
    response: { id: 'string', title: 'string', status: 'string', created_at: 'date' }
  },
  {
    method: 'POST',
    path: '/api/v1/repairs',
    description: 'Create a new repair request',
    auth: 'Required',
    params: [
      { name: 'title', type: 'string', required: true, desc: 'Repair title' },
      { name: 'description', type: 'string', required: true, desc: 'Detailed description' },
      { name: 'priority', type: 'string', required: false, desc: 'low, medium, high' }
    ],
    response: { id: 'string', status: 'created' }
  },
  {
    method: 'GET',
    path: '/api/v1/finances',
    description: 'Get financial overview',
    auth: 'Required',
    params: [
      { name: 'year', type: 'number', required: false, desc: 'Filter by year' }
    ],
    response: { balance: 'number', due: 'number', paid: 'number' }
  },
  {
    method: 'GET',
    path: '/api/v1/messages',
    description: 'Get all messages',
    auth: 'Required',
    params: [
      { name: 'unread_only', type: 'boolean', required: false, desc: 'Only unread' }
    ],
    response: [{ id: 'string', sender: 'string', content: 'string', read: 'boolean' }]
  }
];

const MethodBadge = ({ method }) => {
  const colors = {
    'GET': 'bg-blue-100 text-blue-800',
    'POST': 'bg-green-100 text-green-800',
    'PUT': 'bg-yellow-100 text-yellow-800',
    'DELETE': 'bg-red-100 text-red-800'
  };
  return <Badge className={colors[method]}>{method}</Badge>;
};

export default function APIDocumentation() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vollständige REST API Referenz für die Mieterapp
          </p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Base URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded block">
                    https://api.mieterapp.de/v1
                  </code>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Bearer Token in Authorization Header</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Request:</strong> application/json</p>
                  <p><strong>Response:</strong> application/json</p>
                  <p><strong>Rate Limit:</strong> 1000 requests/hour</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-4">
            {API_ENDPOINTS.map((endpoint, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <MethodBadge method={endpoint.method} />
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path, `path-${idx}`)}
                      >
                        {copied === `path-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {endpoint.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Parameters */}
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.params.map((param, pIdx) => (
                          <div key={pIdx} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-blue-600">{param.name}</code>
                              <Badge variant="outline">{param.type}</Badge>
                              {param.required && <Badge className="bg-red-100 text-red-800">Required</Badge>}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{param.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Example */}
                    <div>
                      <h4 className="font-semibold mb-2">Response Example</h4>
                      <code className="text-xs bg-gray-900 text-gray-100 p-4 rounded block overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bearer Token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Alle API-Anfragen erfordern ein Bearer Token im Authorization Header:
                </p>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded block">
                  Authorization: Bearer YOUR_TOKEN_HERE
                </code>
                <Button onClick={() => copyToClipboard('Authorization: Bearer YOUR_TOKEN_HERE', 'auth-example')}>
                  {copied === 'auth-example' ? 'Copied!' : 'Copy'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Limit:</strong> 1000 requests/hour</li>
                  <li>• <strong>Response Header:</strong> X-RateLimit-Remaining</li>
                  <li>• <strong>Status 429:</strong> Rate limit exceeded</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
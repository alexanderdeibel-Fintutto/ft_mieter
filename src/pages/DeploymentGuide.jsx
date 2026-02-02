import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const DEPLOYMENT_STEPS = [
  {
    step: 1,
    title: 'Environment Setup',
    desc: 'Configure production environment variables',
    code: 'STRIPE_KEY=sk_prod_...\nANTHROPIC_KEY=sk-...'
  },
  {
    step: 2,
    title: 'Database Migration',
    desc: 'Run all pending database migrations',
    code: 'npm run db:migrate:prod'
  },
  {
    step: 3,
    title: 'Build & Test',
    desc: 'Build optimized bundle and run tests',
    code: 'npm run build\nnpm run test:prod'
  },
  {
    step: 4,
    title: 'Deploy',
    desc: 'Deploy to production',
    code: 'npm run deploy:prod'
  },
  {
    step: 5,
    title: 'Verify',
    desc: 'Run health checks and monitoring',
    code: 'npm run healthcheck'
  }
];

const PRE_DEPLOYMENT = [
  'All tests passing ✓',
  'Performance optimized ✓',
  'Security audit completed ✓',
  'Environment variables set ✓',
  'Database backups created ✓',
  'SSL certificates valid ✓'
];

export default function DeploymentGuide() {
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deployment Guide</h1>
          <p className="text-gray-600 dark:text-gray-400">Production-ready deployment steps</p>
        </motion.div>

        <Tabs defaultValue="steps" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Deployment Steps</TabsTrigger>
            <TabsTrigger value="checklist">Pre-Deployment</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Steps */}
          <TabsContent value="steps" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-8">
              {DEPLOYMENT_STEPS.map((item, idx) => (
                <motion.button
                  key={item.step}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedStep(idx)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStep === idx
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <p className="font-bold">{item.step}</p>
                  <p className="text-xs">{item.title}</p>
                </motion.button>
              ))}
            </div>

            <motion.div
              key={selectedStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {DEPLOYMENT_STEPS[selectedStep].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">{DEPLOYMENT_STEPS[selectedStep].desc}</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    {DEPLOYMENT_STEPS[selectedStep].code}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Pre-Deployment Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PRE_DEPLOYMENT.map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>Post-Deployment Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4" /> Error Rate</p>
                  <p className="text-2xl font-bold mt-2">0.01%</p>
                  <Badge className="mt-2 bg-green-600">Healthy</Badge>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold">Response Time</p>
                  <p className="text-2xl font-bold mt-2">145ms</p>
                  <Badge className="mt-2 bg-green-600">Optimal</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
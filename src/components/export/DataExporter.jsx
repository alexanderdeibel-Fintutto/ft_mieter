import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileJson, FileText, BarChart3 } from 'lucide-react';

export function DataExporter({ data = [], filename = 'export' }) {
  const [exporting, setExporting] = useState(null);

  const exportToJSON = () => {
    setExporting('json');
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString()}.json`;
    a.click();
    setTimeout(() => setExporting(null), 500);
  };

  const exportToCSV = () => {
    setExporting('csv');
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header =>
          String(row[header]).includes(',') ? `"${row[header]}"` : row[header]
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString()}.csv`;
    a.click();
    setTimeout(() => setExporting(null), 500);
  };

  const exportToXML = () => {
    setExporting('xml');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  ${data.map(item =>
    `<item>${Object.entries(item).map(([k, v]) =>
      `<${k}>${v}</${k}>`
    ).join('')}</item>`
  ).join('\n')}
</root>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString()}.xml`;
    a.click();
    setTimeout(() => setExporting(null), 500);
  };

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToJSON}
        className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileJson className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold">JSON Export</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Structured data format</p>
            </div>
          </div>
          {exporting === 'json' ? (
            <Badge className="bg-green-600">Exporting...</Badge>
          ) : (
            <Download className="w-5 h-5" />
          )}
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToCSV}
        className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold">CSV Export</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Spreadsheet compatible</p>
            </div>
          </div>
          {exporting === 'csv' ? (
            <Badge className="bg-green-600">Exporting...</Badge>
          ) : (
            <Download className="w-5 h-5" />
          )}
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToXML}
        className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-semibold">XML Export</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Standard markup format</p>
            </div>
          </div>
          {exporting === 'xml' ? (
            <Badge className="bg-green-600">Exporting...</Badge>
          ) : (
            <Download className="w-5 h-5" />
          )}
        </div>
      </motion.button>
    </div>
  );
}

export function ExportModal({ isOpen, onClose, data, filename }) {
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6"
      >
        <h2 className="text-xl font-bold mb-4">Export Data</h2>
        <DataExporter data={data} filename={filename} />
      </motion.div>
    </>
  );
}
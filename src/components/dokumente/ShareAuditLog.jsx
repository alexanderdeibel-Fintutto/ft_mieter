import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareAuditLog({ documentId, isOpen }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && expanded) {
      loadAuditLog();
    }
  }, [isOpen, expanded]);

  const loadAuditLog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_share_audit')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error loading audit log:', error);
      toast.error('Fehler beim Laden des Audit-Logs');
    }
    setLoading(false);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'shared': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'downloaded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
      >
        <span>📋 Freigabe-Verlauf</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-gray-500 p-2">Kein Verlauf</p>
          ) : (
            auditLogs.map(log => (
              <div key={log.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between">
                  <Badge className={getActionColor(log.action)}>
                    {log.action === 'shared' && 'Geteilt'}
                    {log.action === 'revoked' && 'Widerrufen'}
                    {log.action === 'viewed' && 'Angesehen'}
                    {log.action === 'downloaded' && 'Heruntergeladen'}
                  </Badge>
                  <span className="text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {log.user_email && (
                  <p className="text-gray-600 mt-1">{log.user_email}</p>
                )}
                {log.details && (
                  <p className="text-gray-500 mt-1">{log.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
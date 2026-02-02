import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

/**
 * WELLE 1: Real-time Notifications für Document Shares
 * Benachrichtigt User wenn Dokumente geteilt oder Freigaben widerrufen werden
 */
export function useShareNotifications(userId) {
  useEffect(() => {
    if (!userId) return;

    // Subscribe zu neuen Shares
    const subscription = supabase
      .from(`document_shares:shared_with_user_id=eq.${userId}`)
      .on('INSERT', (payload) => {
        const doc = payload.new.documents?.[0];
        toast.success(`📄 ${doc?.file_name || 'Dokument'} wurde mit dir geteilt!`);
      })
      .on('DELETE', (payload) => {
        toast.info('📄 Eine Freigabe wurde widerrufen');
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [userId]);
}

export function useShareAuditNotifications(documentId) {
  useEffect(() => {
    if (!documentId) return;

    // Subscribe zu Audit-Events
    const subscription = supabase
      .from(`document_share_audit:document_id=eq.${documentId}`)
      .on('INSERT', (payload) => {
        const log = payload.new;
        
        if (log.action === 'downloaded') {
          toast.info(`📥 ${log.user_email} hat das Dokument heruntergeladen`);
        } else if (log.action === 'viewed') {
          toast.info(`👁️ ${log.user_email} hat das Dokument angesehen`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [documentId]);
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

export function useSharedDocuments(userId) {
  return useQuery({
    queryKey: ['sharedDocuments', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('document_shares')
        .select(`
          id,
          access_level,
          expires_at,
          shared_by,
          created_at,
          documents (
            id,
            title,
            file_name,
            file_url,
            document_type,
            file_type,
            file_size,
            created_at,
            buildings (name)
          )
        `)
        .eq('shared_with_user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareData) => {
      const { data, error } = await supabase
        .from('document_shares')
        .insert(shareData)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments', variables.shared_with_user_id] });
      toast.success('Dokument geteilt');
    },
    onError: (error) => {
      console.error('Error sharing document:', error);
      toast.error('Fehler beim Teilen des Dokuments');
    },
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId) => {
      const { error } = await supabase
        .from('document_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      toast.success('Freigabe entfernt');
    },
    onError: (error) => {
      console.error('Error revoking share:', error);
      toast.error('Fehler beim Entfernen der Freigabe');
    },
  });
}

export function useDocumentAccessControl() {
  return useMutation({
    mutationFn: async ({ userId, documentId }) => {
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('uploaded_by, org_id, tenant_id')
        .eq('id', documentId)
        .single();

      if (docError) throw docError;

      // Ist User der Ersteller?
      if (doc.uploaded_by === userId) {
        return { access: true, level: 'owner' };
      }

      // Hat User explizite Freigabe?
      const { data: share, error: shareError } = await supabase
        .from('document_shares')
        .select('access_level, expires_at')
        .eq('document_id', documentId)
        .eq('shared_with_user_id', userId)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();

      if (share) {
        return { access: true, level: share.access_level };
      }

      // Standard: kein Zugang
      return { access: false, level: null };
    },
  });
}
import React, { useEffect, useState } from 'react';
import { getReadReceipts, subscribeToReadReceipts } from '../services/messagingAdvanced';
import { Check } from 'lucide-react';

export function ReadReceipts({ messageId, status = 'sent' }) {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const loadReceipts = async () => {
      const data = await getReadReceipts(messageId);
      setReceipts(data);
    };
    
    loadReceipts();
    const subscription = subscribeToReadReceipts(messageId, (receipt) => {
      setReceipts(prev => {
        const exists = prev.some(r => r.user_id === receipt.user_id);
        return exists ? prev : [...prev, receipt];
      });
    });

    return () => subscription?.unsubscribe();
  }, [messageId]);

  const getStatusIcon = () => {
    if (receipts.length > 0) {
      return <Check size={14} className="text-blue-500" title={`${receipts.length} Nutzer haben gelesen`} />;
    }
    if (status === 'delivered') {
      return <Check size={14} className="text-gray-400" title="Zugestellt" />;
    }
    if (status === 'sent') {
      return <Check size={14} className="text-gray-300" title="Gesendet" />;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      {receipts.length > 0 && (
        <span className="text-xs text-gray-500" title={receipts.map(r => r.user?.full_name || r.user?.email).join(', ')}>
          {receipts.length}
        </span>
      )}
    </div>
  );
}
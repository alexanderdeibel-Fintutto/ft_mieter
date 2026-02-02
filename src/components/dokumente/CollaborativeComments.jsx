import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborativeComments({ documentId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'Current User',
        createdAt: new Date().toISOString(),
        resolved: false,
      };

      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Kommentar hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4" />
        <h4 className="font-medium text-sm">Kommentare ({comments.length})</h4>
      </div>

      {/* Comments List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="p-2 bg-gray-50 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback>{comment.author[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{comment.author}</span>
              <span className="text-gray-500">
                {new Date(comment.createdAt).toLocaleTimeString('de-DE')}
              </span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <Input
          placeholder="Kommentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          className="flex-1 text-xs"
        />
        <Button
          size="sm"
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
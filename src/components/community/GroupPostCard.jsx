import React, { useState } from 'react';
import { MessageCircle, Heart, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function GroupPostCard({ post, currentUserId, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const isLiked = post.likes?.includes(currentUserId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onComment(post.id, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
          {post.author.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{post.author}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(post.created_at), 'dd. MMM, HH:mm', { locale: de })}
          </p>
        </div>
        {post.isPinned && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">📌 Angepinnt</span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {post.image && (
        <img 
          src={post.image} 
          alt="" 
          className="mt-3 rounded-lg w-full max-h-64 object-cover cursor-pointer hover:opacity-90"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {post.likes?.length || 0}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#8B5CF6]"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments?.length || 0}
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Kommentar schreiben..."
              className="flex-1 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="w-3 h-3" />
            </Button>
          </div>

          {/* Comments List */}
          {post.comments?.length > 0 ? (
            <div className="space-y-2">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{comment.author}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(comment.created_at), 'dd.MM. HH:mm', { locale: de })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">Noch keine Kommentare</p>
          )}
        </div>
      )}
    </div>
  );
}
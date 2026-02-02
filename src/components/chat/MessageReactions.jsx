import React, { useState } from 'react';
import { addReaction, subscribeToReactions } from '../services/messagingAdvanced';
import { Smile } from 'lucide-react';
import { useEffect } from 'react';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

export function MessageReactions({ messageId, reactions = [] }) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);

  useEffect(() => {
    const subscription = subscribeToReactions(messageId, (message) => {
      setLocalReactions(message.reactions || []);
    });

    return () => subscription?.unsubscribe();
  }, [messageId]);

  const handleAddReaction = async (emoji) => {
    await addReaction(messageId, emoji);
    setShowEmojis(false);
  };

  const reactionCounts = {};
  localReactions.forEach(r => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });

  return (
    <div className="flex flex-wrap gap-1 mt-1 items-center">
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => handleAddReaction(emoji)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs transition"
        >
          <span>{emoji}</span>
          <span className="text-gray-600">{count}</span>
        </button>
      ))}
      
      <div className="relative">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <Smile size={16} className="text-gray-400" />
        </button>
        
        {showEmojis && (
          <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-4 gap-2 z-10">
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="text-lg hover:bg-gray-100 p-1 rounded transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
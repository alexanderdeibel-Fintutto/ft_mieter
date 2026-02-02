import { supabase, getCurrentUser } from './supabase';

// ============================================================================
// TYPING INDICATORS
// ============================================================================

export async function setTypingStatus(conversationId) {
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('email', user.email)
    .single();
  
  const userName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email;
  
  const expiresAt = new Date(Date.now() + 5000).toISOString();
  
  const { error } = await supabase
    .from('typing_indicators')
    .upsert({
      conversation_id: conversationId,
      user_id: user.id,
      user_name: userName,
      started_at: new Date().toISOString(),
      expires_at: expiresAt
    }, {
      onConflict: 'conversation_id,user_id'
    });
  
  return !error;
}

export function subscribeToTypingIndicators(conversationId, callback) {
  return supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => callback(payload)
    )
    .subscribe();
}

// ============================================================================
// READ RECEIPTS
// ============================================================================

export async function markMessageAsRead(messageId, conversationId) {
  const user = await getCurrentUser();
  
  const { error } = await supabase
    .from('read_receipts')
    .upsert({
      message_id: messageId,
      conversation_id: conversationId,
      user_id: user.id,
      read_at: new Date().toISOString()
    }, {
      onConflict: 'message_id,user_id'
    });
  
  return !error;
}

export async function getReadReceipts(messageId) {
  const { data, error } = await supabase
    .from('read_receipts')
    .select(`
      *,
      user:user_id (
        email,
        full_name
      )
    `)
    .eq('message_id', messageId);
  
  return error ? [] : data;
}

export function subscribeToReadReceipts(messageId, callback) {
  return supabase
    .channel(`reads:${messageId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'read_receipts',
        filter: `message_id=eq.${messageId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// ============================================================================
// MESSAGE REACTIONS
// ============================================================================

export async function addReaction(messageId, emoji) {
  const user = await getCurrentUser();
  
  const { data: message } = await supabase
    .from('messages')
    .select('reactions')
    .eq('id', messageId)
    .single();
  
  const reactions = message?.reactions || [];
  const existingIndex = reactions.findIndex(r => r.emoji === emoji && r.user_id === user.id);
  
  if (existingIndex >= 0) {
    reactions.splice(existingIndex, 1);
  } else {
    reactions.push({
      emoji,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
  }
  
  const { error } = await supabase
    .from('messages')
    .update({ reactions })
    .eq('id', messageId);
  
  return !error;
}

export function subscribeToReactions(messageId, callback) {
  return supabase
    .channel(`reactions:${messageId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `id=eq.${messageId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// ============================================================================
// GROUP CHATS
// ============================================================================

export async function createGroupChat(name, memberIds, options = {}) {
  const user = await getCurrentUser();
  
  const { data: groupChat, error } = await supabase
    .from('group_chats')
    .insert({
      name,
      member_ids: [user.id, ...memberIds],
      created_by: user.id,
      description: options.description,
      building_id: options.buildingId,
      org_id: options.orgId,
      is_public: options.isPublic || false
    })
    .select()
    .single();
  
  return { success: !error, groupChat, error: error?.message };
}

export async function getGroupChats() {
  const user = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('group_chats')
    .select('*')
    .contains('member_ids', [user.id]);
  
  return error ? [] : data;
}

export async function addGroupMember(groupChatId, userId) {
  const { data: groupChat } = await supabase
    .from('group_chats')
    .select('member_ids')
    .eq('id', groupChatId)
    .single();
  
  if (!groupChat) return { success: false };
  
  const members = groupChat.member_ids || [];
  if (!members.includes(userId)) {
    members.push(userId);
  }
  
  const { error } = await supabase
    .from('group_chats')
    .update({ member_ids: members })
    .eq('id', groupChatId);
  
  return { success: !error, error: error?.message };
}

export async function removeGroupMember(groupChatId, userId) {
  const { data: groupChat } = await supabase
    .from('group_chats')
    .select('member_ids')
    .eq('id', groupChatId)
    .single();
  
  if (!groupChat) return { success: false };
  
  const members = (groupChat.member_ids || []).filter(id => id !== userId);
  
  const { error } = await supabase
    .from('group_chats')
    .update({ member_ids: members })
    .eq('id', groupChatId);
  
  return { success: !error, error: error?.message };
}

// ============================================================================
// BROADCASTS
// ============================================================================

export async function createBroadcast(title, content, options = {}) {
  const user = await getCurrentUser();
  
  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .insert({
      sender_id: user.id,
      title,
      content,
      org_id: options.orgId,
      building_id: options.buildingId,
      recipient_ids: options.recipientIds || [],
      target_type: options.targetType || 'specific_users',
      status: options.status || 'draft'
    })
    .select()
    .single();
  
  return { success: !error, broadcast, error: error?.message };
}

export async function sendBroadcast(broadcastId) {
  const { error } = await supabase
    .from('broadcasts')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', broadcastId);
  
  return { success: !error, error: error?.message };
}

export async function getBroadcasts(options = {}) {
  let query = supabase.from('broadcasts').select('*');
  
  if (options.orgId) query = query.eq('org_id', options.orgId);
  if (options.buildingId) query = query.eq('building_id', options.buildingId);
  if (options.status) query = query.eq('status', options.status);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return error ? [] : data;
}

// ============================================================================
// MESSAGE SEARCH
// ============================================================================

export async function searchMessages(query, options = {}) {
  let search = supabase
    .from('messages')
    .select('*')
    .ilike('content', `%${query}%`);
  
  if (options.conversationId) {
    search = search.eq('conversation_id', options.conversationId);
  }
  
  if (options.senderIds) {
    search = search.in('sender_id', options.senderIds);
  }
  
  if (options.after) {
    search = search.gte('created_at', options.after);
  }
  
  if (options.before) {
    search = search.lte('created_at', options.before);
  }
  
  const { data, error } = await search
    .order('created_at', { ascending: false })
    .limit(options.limit || 50);
  
  return error ? [] : data;
}

export async function getConversationStats(conversationId) {
  const { data: stats } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId);
  
  const { data: unread } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .is('read_at', null);
  
  return {
    totalMessages: stats?.length || 0,
    unreadMessages: unread?.length || 0
  };
}
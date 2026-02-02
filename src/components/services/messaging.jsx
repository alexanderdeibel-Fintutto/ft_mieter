import { supabase, getCurrentUser, getPrimaryOrg } from './supabase';

// MieterApp Konfiguration
const APP_CONFIG = {
  appId: 'mieterapp',
  userType: 'tenant'
};

// ============================================================================
// CONVERSATIONS
// ============================================================================

/**
 * Meine Conversations laden
 */
export async function getMyConversations({ 
  type = null, 
  buildingId = null,
  limit = 50 
} = {}) {
  const user = await getCurrentUser();
  if (!user) return [];
  
  let query = supabase
    .from('v_my_conversations')
    .select('*')
    .limit(limit);
  
  if (type) query = query.eq('conversation_type', type);
  if (buildingId) query = query.eq('building_id', buildingId);
  
  const { data, error } = await query;
  if (error) {
    console.error('Get Conversations Error:', error);
    return [];
  }
  return data;
}

/**
 * Conversation erstellen (Direct Message)
 */
export async function createDirectConversation(recipientUserId, initialMessage = null) {
  const user = await getCurrentUser();
  const org = await getPrimaryOrg();
  
  // Prüfen ob bereits Conversation existiert
  const { data: existing } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', user.id);
  
  if (existing?.length > 0) {
    // Prüfe ob Recipient auch Member ist
    const conversationIds = existing.map(e => e.conversation_id);
    const { data: recipientConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', recipientUserId)
      .in('conversation_id', conversationIds);
    
    if (recipientConvs?.length > 0) {
      // Bestehende Conversation zurückgeben
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', recipientConvs[0].conversation_id)
        .eq('conversation_type', 'direct')
        .single();
      
      if (conv) return { success: true, conversation: conv };
    }
  }
  
  // Neue Conversation erstellen
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      org_id: org?.id,
      conversation_type: 'direct',
      created_by: user.id,
      source_app: APP_CONFIG.appId
    })
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  // Members hinzufügen
  await supabase.from('conversation_members').insert([
    {
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'owner',
      user_app: APP_CONFIG.appId,
      user_type: APP_CONFIG.userType
    },
    {
      conversation_id: conversation.id,
      user_id: recipientUserId,
      role: 'member',
      user_type: 'landlord'
    }
  ]);
  
  // Optional: Erste Nachricht senden
  if (initialMessage) {
    await sendMessage(conversation.id, initialMessage);
  }
  
  return { success: true, conversation };
}


// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Nachrichten einer Conversation laden
 */
export async function getMessages(conversationId, { limit = 50, before = null } = {}) {
  let query = supabase
    .from('messages')
    .select(`
      *,
      message_attachments (*),
      reply_to:reply_to_id (
        id, content, sender_name
      )
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (before) {
    query = query.lt('created_at', before);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Get Messages Error:', error);
    return [];
  }
  
  // Als gelesen markieren
  await supabase.rpc('mark_messages_read', { p_conversation_id: conversationId });
  
  return data.reverse(); // Chronologisch
}

/**
 * Nachricht senden
 */
export async function sendMessage(conversationId, content, options = {}) {
  const user = await getCurrentUser();
  
  // User Profile für Namen laden
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('email', user.email)
    .single();
  
  const senderName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email;
  
  const messageData = {
    conversation_id: conversationId,
    sender_id: user.id,
    sender_name: senderName,
    sender_type: APP_CONFIG.userType,
    sender_app: APP_CONFIG.appId,
    content,
    content_type: options.type || 'text',
    reply_to_id: options.replyTo || null,
    mentions: options.mentions || []
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  return { success: true, message: data };
}

/**
 * Nachricht mit Bild senden
 */
export async function sendImageMessage(conversationId, file, caption = '') {
  const user = await getCurrentUser();
  
  // Bild hochladen
  const fileName = `messages/${conversationId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
  
  if (uploadError) return { success: false, error: uploadError.message };
  
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
  
  // User Profile für Namen laden
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('email', user.email)
    .single();
  
  const senderName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user.email;
  
  // Nachricht mit Attachment erstellen
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_name: senderName,
      sender_type: APP_CONFIG.userType,
      sender_app: APP_CONFIG.appId,
      content: caption || 'Bild',
      content_type: 'image'
    })
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  
  // Attachment-Eintrag
  await supabase.from('message_attachments').insert({
    message_id: message.id,
    file_url: publicUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    attachment_type: 'image'
  });
  
  return { success: true, message };
}


// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Ungelesene Notifications laden
 */
export async function getUnreadNotifications() {
  const { data, error } = await supabase
    .from('v_my_unread_notifications')
    .select('*')
    .limit(50);
  
  if (error) return [];
  return data;
}

/**
 * Notification als gelesen markieren
 */
export async function markNotificationRead(notificationId) {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

/**
 * Alle Notifications als gelesen markieren
 */
export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);
}


// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

/**
 * Auf neue Nachrichten in Conversation subscriben
 */
export function subscribeToConversation(conversationId, callback) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

/**
 * Auf neue Notifications subscriben
 */
export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}


// ============================================================================
// TASKS MIT KOMMUNIKATION
// ============================================================================

/**
 * Schadensmeldung erstellen (mit automatischer Conversation)
 */
export async function createDamageReport({
  buildingId,
  unitId,
  title,
  description,
  priority = 'normal',
  photos = []
}) {
  const user = await getCurrentUser();
  const org = await getPrimaryOrg();
  
  // Task erstellen (Trigger erstellt automatisch Conversation!)
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      org_id: org?.id,
      building_id: buildingId,
      unit_id: unitId,
      title,
      description,
      task_type: 'damage_report',
      priority,
      status: 'open',
      source_app: APP_CONFIG.appId,
      created_by: user.id,
      reported_by: user.id,
      reported_by_type: APP_CONFIG.userType
    })
    .select('*, conversations(*)')
    .single();
  
  if (error) return { success: false, error: error.message };
  
  // Fotos hochladen
  if (photos.length > 0) {
    for (const photo of photos) {
      const fileName = `tasks/${task.id}/${Date.now()}_${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, photo);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        await supabase.from('task_photos').insert({
          task_id: task.id,
          photo_url: publicUrl,
          photo_type: 'damage',
          uploaded_by: user.id
        });
      }
    }
  }
  
  // Task-Watcher hinzufügen
  await supabase.from('task_watchers').insert({
    task_id: task.id,
    user_id: user.id,
    watch_reason: 'creator',
    user_app: APP_CONFIG.appId,
    user_type: APP_CONFIG.userType
  });
  
  return { success: true, task };
}

/**
 * Task-Status ändern (mit Notification)
 */
export async function updateTaskStatus(taskId, newStatus, comment = null) {
  const { error } = await supabase.rpc('update_task_status', {
    p_task_id: taskId,
    p_new_status: newStatus,
    p_comment: comment
  });
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}
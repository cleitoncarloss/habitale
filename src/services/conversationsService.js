import supabase from './supabaseClient';
import { CONVERSATION_STATUSES } from '@constants/conversationStatuses';

async function fetchAll() {
  const result = await supabase
    .from('conversas')
    .select('*')
    .order('created_at', { ascending: false });

  return result;
}

async function fetchById(conversationId) {
  const result = await supabase
    .from('conversas')
    .select('*')
    .eq('id', conversationId)
    .single();

  return result;
}

async function fetchMessages(conversationId) {
  const result = await supabase
    .from('mensagens_conversa')
    .select('*')
    .eq('conversa_id', conversationId)
    .order('created_at', { ascending: true });

  return result;
}

async function updateStatus(conversationId, newStatus) {
  const result = await supabase
    .from('conversas')
    .update({ status: newStatus, updated_at: new Date() })
    .eq('id', conversationId);

  return result;
}

async function addMessage(conversationId, senderType, content) {
  const result = await supabase
    .from('mensagens_conversa')
    .insert({
      conversa_id: conversationId,
      remetente: senderType,
      conteudo: content,
    });

  return result;
}

function subscribeToConversations(callback) {
  const subscription = supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversas' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

function subscribeToMessages(conversationId, callback) {
  const subscription = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mensagens_conversa',
        filter: `conversa_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

export {
  fetchAll,
  fetchById,
  fetchMessages,
  updateStatus,
  addMessage,
  subscribeToConversations,
  subscribeToMessages,
};

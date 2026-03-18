import supabase from './supabaseClient';

async function fetchAll() {
  const result = await supabase
    .from('conversas_whatsapp')
    .select('*')
    .order('created_at', { ascending: false });

  return result;
}

async function fetchById(conversationId) {
  const result = await supabase
    .from('conversas_whatsapp')
    .select('*')
    .eq('id', conversationId)
    .single();

  return result;
}

async function create(conversationData) {
  const result = await supabase
    .from('conversas_whatsapp')
    .insert({
      cliente_id: conversationData.clientId || null,
      nome_cliente: conversationData.clientName,
      telefone: conversationData.phone,
      assunto: conversationData.subject,
      status: conversationData.status || 'novo',
      duvida_ou_questao: conversationData.concern,
    })
    .select()
    .single();

  return result;
}

async function update(conversationId, conversationData) {
  const updatePayload = {};

  if (conversationData.clientId !== undefined) updatePayload.cliente_id = conversationData.clientId;
  if (conversationData.clientName !== undefined) updatePayload.nome_cliente = conversationData.clientName;
  if (conversationData.phone !== undefined) updatePayload.telefone = conversationData.phone;
  if (conversationData.subject !== undefined) updatePayload.assunto = conversationData.subject;
  if (conversationData.status !== undefined) updatePayload.status = conversationData.status;
  if (conversationData.concern !== undefined) updatePayload.duvida_ou_questao = conversationData.concern;

  const result = await supabase
    .from('conversas_whatsapp')
    .update(updatePayload)
    .eq('id', conversationId)
    .select()
    .single();

  return result;
}

async function updateStatus(conversationId, newStatus) {
  const result = await supabase
    .from('conversas_whatsapp')
    .update({ status: newStatus })
    .eq('id', conversationId);

  return result;
}

async function addMessage(conversationId, message, sender = 'cliente') {
  const result = await supabase
    .from('mensagens_conversa')
    .insert({
      conversa_id: conversationId,
      remetente: sender,
      mensagem: message,
    })
    .select()
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

async function fetchMessagesByPhone(phoneNumber) {
  const result = await supabase
    .from('historico_mensagens')
    .select('*')
    .eq('telefone', phoneNumber)
    .order('timestamp', { ascending: true });

  return result;
}

async function fetchConversationsFromHistory() {
  const result = await supabase
    .from('historico_mensagens')
    .select('telefone, mensagem, timestamp, created_at, patient')
    .order('timestamp', { ascending: false });

  if (result.error) {
    return result;
  }

  const conversationMap = new Map();

  result.data?.forEach((message) => {
    if (!conversationMap.has(message.telefone)) {
      const displayName = message.patient || `Cliente ${message.telefone.slice(-4)}`;

      conversationMap.set(message.telefone, {
        id: message.telefone,
        telefone: message.telefone,
        nome_cliente: displayName,
        assunto: 'Conversa via WhatsApp',
        status: 'em_progresso',
        created_at: message.created_at,
        ultima_mensagem: message.mensagem,
        ultima_mensagem_em: message.timestamp,
      });
    }
  });

  return {
    data: Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.ultima_mensagem_em) - new Date(a.ultima_mensagem_em)
    ),
    error: null,
  };
}

function subscribeToConversations(callback) {
  const subscription = supabase
    .channel('whatsapp-conversations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversas_whatsapp' },
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
  create,
  update,
  updateStatus,
  addMessage,
  fetchMessages,
  fetchMessagesByPhone,
  fetchConversationsFromHistory,
  subscribeToConversations,
};

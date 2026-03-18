import { useState, useEffect } from 'react';
import * as whatsappConversationsService from '@services/whatsappConversationsService';

function useWhatsappConversations() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();

    const subscription = whatsappConversationsService.subscribeToConversations((payload) => {
      handleConversationChange(payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadConversations() {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await whatsappConversationsService.fetchAll();

    if (queryError) {
      console.error('Erro ao carregar conversas WhatsApp:', queryError);
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    console.log('Conversas WhatsApp carregadas:', data);
    setConversations(data || []);
    setIsLoading(false);
  }

  function handleConversationChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setConversations((current) => [newRecord, ...current]);
      return;
    }

    if (eventType === 'UPDATE') {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === newRecord.id ? newRecord : conversation
        )
      );
      return;
    }

    if (eventType === 'DELETE') {
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== oldRecord.id)
      );
    }
  }

  async function updateConversationStatus(conversationId, newStatus) {
    setError(null);
    const { error: updateError } = await whatsappConversationsService.updateStatus(conversationId, newStatus);

    if (updateError) {
      setError(updateError.message);
    }
  }

  return {
    conversations,
    isLoading,
    error,
    updateConversationStatus,
    loadConversations,
  };
}

export default useWhatsappConversations;

import { useState, useEffect } from 'react';
import * as conversationsService from '@services/conversationsService';

function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();

    const subscription = conversationsService.subscribeToConversations((payload) => {
      handleConversationChange(payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadConversations() {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await conversationsService.fetchAll();

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

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
    const { error: updateError } = await conversationsService.updateStatus(conversationId, newStatus);

    if (updateError) {
      setError(updateError.message);
    }
  }

  async function addMessageToConversation(conversationId, senderType, content) {
    setError(null);
    const { error: messageError } = await conversationsService.addMessage(conversationId, senderType, content);

    if (messageError) {
      setError(messageError.message);
    }
  }

  async function fetchConversationMessages(conversationId) {
    const { data, error: queryError } = await conversationsService.fetchMessages(conversationId);

    if (queryError) {
      setError(queryError.message);
      return [];
    }

    return data || [];
  }

  return {
    conversations,
    isLoading,
    error,
    updateConversationStatus,
    addMessageToConversation,
    fetchConversationMessages,
    loadConversations,
  };
}

export default useConversations;

import { useState, useEffect } from 'react';
import * as clientsService from '@services/clientsService';

function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClients();

    const subscription = clientsService.subscribeToClients((payload) => {
      handleClientChange(payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadClients() {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await clientsService.fetchAll();

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    setClients(data || []);
    setIsLoading(false);
  }

  function handleClientChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setClients((current) => [newRecord, ...current]);
      return;
    }

    if (eventType === 'UPDATE') {
      setClients((current) =>
        current.map((client) =>
          client.id === newRecord.id ? newRecord : client
        )
      );
      return;
    }

    if (eventType === 'DELETE') {
      setClients((current) =>
        current.filter((client) => client.id !== oldRecord.id)
      );
    }
  }

  async function createClient(clientData) {
    setError(null);
    const { data, error: createError } = await clientsService.create(clientData);

    if (createError) {
      setError(createError.message);
      return null;
    }

    return data;
  }

  async function updateClient(clientId, clientData) {
    setError(null);
    const { error: updateError } = await clientsService.update(clientId, clientData);

    if (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteClient(clientId) {
    setError(null);
    const { error: deleteError } = await clientsService.remove(clientId);

    if (deleteError) {
      setError(deleteError.message);
    }
  }

  async function fetchClientById(clientId) {
    const { data, error: queryError } = await clientsService.fetchById(clientId);

    if (queryError) {
      setError(queryError.message);
      return null;
    }

    return data;
  }

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    fetchClientById,
    loadClients,
  };
}

export default useClients;

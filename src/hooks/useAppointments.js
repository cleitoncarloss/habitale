import { useState, useEffect } from 'react';
import * as appointmentsService from '@services/appointmentsService';

function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();

    const subscription = appointmentsService.subscribeToAppointments((payload) => {
      handleAppointmentChange(payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadAppointments() {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await appointmentsService.fetchAll();

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    setAppointments(data || []);
    setIsLoading(false);
  }

  function handleAppointmentChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      setAppointments((current) => [newRecord, ...current]);
      return;
    }

    if (eventType === 'UPDATE') {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === newRecord.id ? newRecord : appointment
        )
      );
      return;
    }

    if (eventType === 'DELETE') {
      setAppointments((current) =>
        current.filter((appointment) => appointment.id !== oldRecord.id)
      );
    }
  }

  async function createAppointment(appointmentData) {
    setError(null);
    const { data, error: createError } = await appointmentsService.create(appointmentData);

    if (createError) {
      setError(createError.message);
      return null;
    }

    return data;
  }

  async function updateAppointment(appointmentId, appointmentData) {
    setError(null);
    const { error: updateError } = await appointmentsService.update(appointmentId, appointmentData);

    if (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteAppointment(appointmentId) {
    setError(null);
    const { error: deleteError } = await appointmentsService.remove(appointmentId);

    if (deleteError) {
      setError(deleteError.message);
    }
  }

  async function fetchAppointmentsByClientId(clientId) {
    const { data, error: queryError } = await appointmentsService.fetchByClientId(clientId);

    if (queryError) {
      setError(queryError.message);
      return [];
    }

    return data || [];
  }

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointmentsByClientId,
    loadAppointments,
  };
}

export default useAppointments;

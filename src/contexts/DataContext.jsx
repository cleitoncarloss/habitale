import { createContext, useState, useCallback, useEffect } from 'react';
import * as clientsService from '@services/clientsService';
import * as appointmentsService from '@services/appointmentsService';
import * as professionalsService from '@services/professionalsService';
import * as whatsappConversationsService from '@services/whatsappConversationsService';

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [cache, setCache] = useState({
    patients: null,
    appointments: null,
    professionals: null,
    conversations: null,
  });

  const [loading, setLoading] = useState({
    patients: false,
    appointments: false,
    professionals: false,
    conversations: false,
  });

  const [errors, setErrors] = useState({
    patients: null,
    appointments: null,
    professionals: null,
    conversations: null,
  });

  const loadPatients = useCallback(async (forceRefresh = false) => {
    if (cache.patients && !forceRefresh) {
      return cache.patients;
    }

    setLoading((prev) => ({ ...prev, patients: true }));
    try {
      const result = await clientsService.fetchAll();
      const data = result.data || [];
      setCache((prev) => ({ ...prev, patients: data }));
      setErrors((prev) => ({ ...prev, patients: null }));
      return data;
    } catch (error) {
      const errorMsg = error.message || 'Erro ao carregar pacientes';
      setErrors((prev) => ({ ...prev, patients: errorMsg }));
      console.error(errorMsg, error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }
  }, [cache.patients]);

  const loadAppointments = useCallback(async (forceRefresh = false) => {
    if (cache.appointments && !forceRefresh) {
      return cache.appointments;
    }

    setLoading((prev) => ({ ...prev, appointments: true }));
    try {
      const result = await appointmentsService.fetchAll();
      const data = result.data || [];
      setCache((prev) => ({ ...prev, appointments: data }));
      setErrors((prev) => ({ ...prev, appointments: null }));
      return data;
    } catch (error) {
      const errorMsg = error.message || 'Erro ao carregar agendamentos';
      setErrors((prev) => ({ ...prev, appointments: errorMsg }));
      console.error(errorMsg, error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  }, [cache.appointments]);

  const loadProfessionals = useCallback(async (forceRefresh = false) => {
    if (cache.professionals && !forceRefresh) {
      return cache.professionals;
    }

    setLoading((prev) => ({ ...prev, professionals: true }));
    try {
      const result = await professionalsService.fetchAll();
      const data = result.data || [];
      setCache((prev) => ({ ...prev, professionals: data }));
      setErrors((prev) => ({ ...prev, professionals: null }));
      return data;
    } catch (error) {
      const errorMsg = error.message || 'Erro ao carregar profissionais';
      setErrors((prev) => ({ ...prev, professionals: errorMsg }));
      console.error(errorMsg, error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, professionals: false }));
    }
  }, [cache.professionals]);

  const loadConversations = useCallback(async (forceRefresh = false) => {
    if (cache.conversations && !forceRefresh) {
      return cache.conversations;
    }

    setLoading((prev) => ({ ...prev, conversations: true }));
    try {
      const result = await whatsappConversationsService.fetchConversationsFromHistory();
      const data = result.data || [];
      setCache((prev) => ({ ...prev, conversations: data }));
      setErrors((prev) => ({ ...prev, conversations: null }));
      return data;
    } catch (error) {
      const errorMsg = error.message || 'Erro ao carregar conversas';
      setErrors((prev) => ({ ...prev, conversations: errorMsg }));
      console.error(errorMsg, error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, [cache.conversations]);

  const clearCache = useCallback(() => {
    setCache({
      patients: null,
      appointments: null,
      professionals: null,
      conversations: null,
    });
  }, []);

  const clearCacheByKey = useCallback((key) => {
    setCache((prev) => ({ ...prev, [key]: null }));
  }, []);

  const addPatient = useCallback((newPatient) => {
    setCache((prev) => ({
      ...prev,
      patients: prev.patients ? [...prev.patients, newPatient] : [newPatient],
    }));
  }, []);

  const updatePatient = useCallback((id, updatedPatient) => {
    setCache((prev) => ({
      ...prev,
      patients: prev.patients
        ? prev.patients.map((p) => (p.id === id ? { ...p, ...updatedPatient } : p))
        : [],
    }));
  }, []);

  const deletePatient = useCallback((id) => {
    setCache((prev) => ({
      ...prev,
      patients: prev.patients ? prev.patients.filter((p) => p.id !== id) : [],
    }));
  }, []);

  const addAppointment = useCallback((newAppointment) => {
    setCache((prev) => ({
      ...prev,
      appointments: prev.appointments
        ? [...prev.appointments, newAppointment]
        : [newAppointment],
    }));
  }, []);

  const updateAppointment = useCallback((id, updatedAppointment) => {
    setCache((prev) => ({
      ...prev,
      appointments: prev.appointments
        ? prev.appointments.map((a) =>
            a.id === id ? { ...a, ...updatedAppointment } : a
          )
        : [],
    }));
  }, []);

  const deleteAppointment = useCallback((id) => {
    setCache((prev) => ({
      ...prev,
      appointments: prev.appointments
        ? prev.appointments.filter((a) => a.id !== id)
        : [],
    }));
  }, []);

  const addProfessional = useCallback((newProfessional) => {
    setCache((prev) => ({
      ...prev,
      professionals: prev.professionals
        ? [...prev.professionals, newProfessional]
        : [newProfessional],
    }));
  }, []);

  const updateProfessional = useCallback((id, updatedProfessional) => {
    setCache((prev) => ({
      ...prev,
      professionals: prev.professionals
        ? prev.professionals.map((p) =>
            p.id === id ? { ...p, ...updatedProfessional } : p
          )
        : [],
    }));
  }, []);

  const deleteProfessional = useCallback((id) => {
    setCache((prev) => ({
      ...prev,
      professionals: prev.professionals
        ? prev.professionals.filter((p) => p.id !== id)
        : [],
    }));
  }, []);

  const value = {
    cache,
    loading,
    errors,
    loadPatients,
    loadAppointments,
    loadProfessionals,
    loadConversations,
    clearCache,
    clearCacheByKey,
    addPatient,
    updatePatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addProfessional,
    updateProfessional,
    deleteProfessional,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

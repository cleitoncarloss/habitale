import supabase from './supabaseClient';
import { APPOINTMENT_STATUSES } from '@constants/appointmentTypes';

async function fetchAll() {
  const result = await supabase
    .from('agendamentos')
    .select('*')
    .order('data_agendamento', { ascending: true });

  return result;
}

async function fetchByClientId(clientId) {
  const result = await supabase
    .from('agendamentos')
    .select('*')
    .eq('cliente_id', clientId)
    .order('data_agendamento', { ascending: true });

  return result;
}

async function fetchById(appointmentId) {
  const result = await supabase
    .from('agendamentos')
    .select('*')
    .eq('id', appointmentId)
    .single();

  return result;
}

async function create(appointmentData) {
  const result = await supabase
    .from('agendamentos')
    .insert({
      cliente_id: appointmentData.clientId,
      profissional_id: appointmentData.professionalId,
      data_agendamento: appointmentData.appointmentDate,
      tipo_servico: appointmentData.serviceType,
      observacoes: appointmentData.observations,
      status: appointmentData.status || 'pendente',
      deve_notificar_1_dia: appointmentData.notifyPatient !== undefined ? appointmentData.notifyPatient : true,
    })
    .select()
    .single();

  return result;
}

async function update(appointmentId, appointmentData) {
  const updatePayload = {};

  if (appointmentData.clientId !== undefined) updatePayload.cliente_id = appointmentData.clientId;
  if (appointmentData.professionalId !== undefined) updatePayload.profissional_id = appointmentData.professionalId;
  if (appointmentData.appointmentDate !== undefined) updatePayload.data_agendamento = appointmentData.appointmentDate;
  if (appointmentData.serviceType !== undefined) updatePayload.tipo_servico = appointmentData.serviceType;
  if (appointmentData.observations !== undefined) updatePayload.observacoes = appointmentData.observations;
  if (appointmentData.status !== undefined) updatePayload.status = appointmentData.status;
  if (appointmentData.notifyPatient !== undefined) updatePayload.deve_notificar_1_dia = appointmentData.notifyPatient;

  const result = await supabase
    .from('agendamentos')
    .update(updatePayload)
    .eq('id', appointmentId)
    .select()
    .single();

  return result;
}

async function remove(appointmentId) {
  const result = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', appointmentId);

  return result;
}

function subscribeToAppointments(callback) {
  const subscription = supabase
    .channel('appointments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'agendamentos' },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

export {
  fetchAll,
  fetchByClientId,
  fetchById,
  create,
  update,
  remove,
  subscribeToAppointments,
};

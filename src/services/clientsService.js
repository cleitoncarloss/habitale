import supabase from './supabaseClient';
import { CLIENT_STATUSES } from '@constants/clientStatuses';

async function fetchAll() {
  const result = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  return result;
}

async function fetchById(clientId) {
  const result = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clientId)
    .single();

  return result;
}

async function create(clientData) {
  const result = await supabase
    .from('clientes')
    .insert({
      nome: clientData.name,
      telefone: clientData.phone,
      email: clientData.email,
      data_nascimento: clientData.birthDate,
      tipo_paciente: clientData.patientType,
      observacoes: clientData.concern,
      status: clientData.status || 'ativo',
    })
    .select()
    .single();

  return result;
}

async function update(clientId, clientData) {
  const updatePayload = {};

  if (clientData.name !== undefined) updatePayload.nome = clientData.name;
  if (clientData.phone !== undefined) updatePayload.telefone = clientData.phone;
  if (clientData.email !== undefined) updatePayload.email = clientData.email;
  if (clientData.birthDate !== undefined) updatePayload.data_nascimento = clientData.birthDate;
  if (clientData.patientType !== undefined) updatePayload.tipo_paciente = clientData.patientType;
  if (clientData.concern !== undefined) updatePayload.observacoes = clientData.concern;
  if (clientData.status !== undefined) updatePayload.status = clientData.status;

  updatePayload.updated_at = new Date();

  const result = await supabase
    .from('clientes')
    .update(updatePayload)
    .eq('id', clientId)
    .select()
    .single();

  return result;
}

async function remove(clientId) {
  const result = await supabase
    .from('clientes')
    .delete()
    .eq('id', clientId);

  return result;
}

function subscribeToClients(callback) {
  const subscription = supabase
    .channel('clients')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'clientes' },
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
  remove,
  subscribeToClients,
};

import supabase from './supabaseClient';

async function fetchAll() {
  const result = await supabase
    .from('profissionais')
    .select('*')
    .order('nome', { ascending: true });

  return result;
}

async function fetchById(professionalId) {
  const result = await supabase
    .from('profissionais')
    .select('*')
    .eq('id', professionalId)
    .single();

  return result;
}

async function create(professionalData) {
  const result = await supabase
    .from('profissionais')
    .insert({
      nome: professionalData.name,
      crm: professionalData.crm,
      especializacao: professionalData.specialization,
      email: professionalData.email,
      telefone: professionalData.phone,
      ativo: true,
    })
    .select()
    .single();

  return result;
}

async function update(professionalId, professionalData) {
  const updatePayload = {};

  if (professionalData.name !== undefined) updatePayload.nome = professionalData.name;
  if (professionalData.crm !== undefined) updatePayload.crm = professionalData.crm;
  if (professionalData.specialization !== undefined) updatePayload.especializacao = professionalData.specialization;
  if (professionalData.email !== undefined) updatePayload.email = professionalData.email;
  if (professionalData.phone !== undefined) updatePayload.telefone = professionalData.phone;
  if (professionalData.ativo !== undefined) updatePayload.ativo = professionalData.ativo;

  const result = await supabase
    .from('profissionais')
    .update(updatePayload)
    .eq('id', professionalId)
    .select()
    .single();

  return result;
}

async function remove(professionalId) {
  const result = await supabase
    .from('profissionais')
    .delete()
    .eq('id', professionalId);

  return result;
}

function subscribeToProfessionals(callback) {
  const subscription = supabase
    .channel('professionals')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profissionais' },
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
  subscribeToProfessionals,
};

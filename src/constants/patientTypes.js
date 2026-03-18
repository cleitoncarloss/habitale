const PATIENT_TYPES = Object.freeze({
  FIRST_CONSULTATION: 'primeira_consulta',
  ACTIVE_PATIENT: 'paciente_ativo',
});

const PATIENT_TYPE_LABELS = Object.freeze({
  [PATIENT_TYPES.FIRST_CONSULTATION]: 'Primeira Consulta',
  [PATIENT_TYPES.ACTIVE_PATIENT]: 'Paciente Ativo',
});

export { PATIENT_TYPES, PATIENT_TYPE_LABELS };

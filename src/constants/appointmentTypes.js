const APPOINTMENT_TYPES = Object.freeze({
  CLEANING: 'limpeza',
  EVALUATION: 'avaliacao',
  ORTHODONTICS: 'aparelho',
  ROOT_CANAL: 'tratamento_canal',
  EXTRACTION: 'extracao',
  OTHER: 'outro',
});

const APPOINTMENT_TYPE_LABELS = Object.freeze({
  [APPOINTMENT_TYPES.CLEANING]: 'Limpeza',
  [APPOINTMENT_TYPES.EVALUATION]: 'Avaliação',
  [APPOINTMENT_TYPES.ORTHODONTICS]: 'Aparelho',
  [APPOINTMENT_TYPES.ROOT_CANAL]: 'Tratamento de Canal',
  [APPOINTMENT_TYPES.EXTRACTION]: 'Extração',
  [APPOINTMENT_TYPES.OTHER]: 'Outro',
});

const APPOINTMENT_STATUSES = Object.freeze({
  CONFIRMED: 'confirmado',
  COMPLETED: 'realizado',
  CANCELLED: 'cancelado',
});

export { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUSES };

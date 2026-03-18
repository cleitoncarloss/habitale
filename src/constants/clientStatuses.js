const CLIENT_STATUSES = Object.freeze({
  NEW: 'novo',
  AWAITING: 'aguardando',
  SCHEDULED: 'agendada',
  COMPLETED: 'realizada',
  CANCELLED: 'cancelada',
});

const CLIENT_STATUS_EMOJIS = Object.freeze({
  [CLIENT_STATUSES.NEW]: '✨',
  [CLIENT_STATUSES.AWAITING]: '⏳',
  [CLIENT_STATUSES.SCHEDULED]: '📅',
  [CLIENT_STATUSES.COMPLETED]: '✅',
  [CLIENT_STATUSES.CANCELLED]: '❌',
});

export { CLIENT_STATUSES, CLIENT_STATUS_EMOJIS };

import { useState } from 'react';
import useAppointments from '@hooks/useAppointments';
import { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS } from '@constants/appointmentTypes';
import { X } from 'lucide-react';

function ScheduleAppointmentModal({ clientId, onClose }) {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [serviceType, setServiceType] = useState(APPOINTMENT_TYPES.CLEANING);
  const [observations, setObservations] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { createAppointment } = useAppointments();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!appointmentDate || !appointmentTime) {
      setError('Data e hora são obrigatórios');
      setIsLoading(false);
      return;
    }

    const created = await createAppointment({
      clientId,
      appointmentDate,
      appointmentTime,
      serviceType,
      observations,
      notifyPatient,
    });

    if (!created) {
      setError('Erro ao criar agendamento');
      setIsLoading(false);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Agendar Consulta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Data *</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Hora *</label>
            <input
              type="time"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Serviço *</label>
            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            >
              {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Observações</label>
            <textarea
              value={observations}
              onChange={(event) => setObservations(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <input
              type="checkbox"
              id="notify_patient_modal"
              checked={notifyPatient}
              onChange={(e) => setNotifyPatient(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="notify_patient_modal" className="text-sm text-gray-700 cursor-pointer select-none">
              Notificar paciente 1 dia antes via WhatsApp
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleAppointmentModal;

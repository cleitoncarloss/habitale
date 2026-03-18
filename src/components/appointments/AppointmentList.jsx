import useAppointments from '@hooks/useAppointments';
import useClients from '@hooks/useClients';
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUSES } from '@constants/appointmentTypes';
import { Edit, Trash2 } from 'lucide-react';

function AppointmentList() {
  const { appointments, isLoading, updateAppointment, deleteAppointment } = useAppointments();
  const { clients } = useClients();

  function getClientName(clientId) {
    const client = clients.find((c) => c.id === clientId);

    return client?.nome || 'Cliente desconhecido';
  }

  async function handleMarkComplete(appointmentId) {
    await updateAppointment(appointmentId, {
      status: APPOINTMENT_STATUSES.COMPLETED,
    });
  }

  async function handleCancel(appointmentId) {
    const confirmed = window.confirm('Deseja cancelar este agendamento?');

    if (confirmed) {
      await updateAppointment(appointmentId, {
        status: APPOINTMENT_STATUSES.CANCELLED,
      });
    }
  }

  async function handleDelete(appointmentId) {
    const confirmed = window.confirm('Deseja deletar este agendamento?');

    if (confirmed) {
      await deleteAppointment(appointmentId);
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Carregando agendamentos...</div>;
  }

  if (appointments.length === 0) {
    return <div className="p-6 text-center text-gray-600">Nenhum agendamento encontrado</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Agendamentos</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Hora</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Serviço</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{getClientName(appointment.cliente_id)}</td>
                <td className="py-3 px-4">{appointment.data_agendamento}</td>
                <td className="py-3 px-4">{appointment.hora_agendamento}</td>
                <td className="py-3 px-4">
                  {APPOINTMENT_TYPE_LABELS[appointment.tipo_servico]}
                </td>
                <td className="py-3 px-4">{appointment.status}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {appointment.status === APPOINTMENT_STATUSES.CONFIRMED && (
                      <button
                        onClick={() => handleMarkComplete(appointment.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Realizado
                      </button>
                    )}
                    {appointment.status === APPOINTMENT_STATUSES.CONFIRMED && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AppointmentList;

import { useState, useEffect } from 'react';
import useClients from '@hooks/useClients';
import useAppointments from '@hooks/useAppointments';
import { X } from 'lucide-react';

function ClientDetailsModal({ clientId, onClose }) {
  const { fetchClientById } = useClients();
  const { fetchAppointmentsByClientId } = useAppointments();
  const [client, setClient] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  async function loadClientData() {
    setIsLoading(true);
    const clientData = await fetchClientById(clientId);
    setClient(clientData);

    const appointments = await fetchAppointmentsByClientId(clientId);
    setClientAppointments(appointments);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <p className="text-center text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Detalhes do Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <p><span className="font-semibold">Nome:</span> {client.nome}</p>
          <p><span className="font-semibold">Telefone:</span> {client.telefone}</p>
          <p><span className="font-semibold">Email:</span> {client.email || '—'}</p>
          <p><span className="font-semibold">Data de Nascimento:</span> {client.data_nascimento || '—'}</p>
          <p><span className="font-semibold">Tipo de Paciente:</span> {client.tipo_paciente}</p>
          <p><span className="font-semibold">Status:</span> {client.status}</p>
        </div>

        <h3 className="text-md font-bold text-gray-900 mb-2">Agendamentos</h3>
        <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-4 mb-4">
          {clientAppointments.length === 0 ? (
            <p className="text-center text-gray-600">Nenhum agendamento</p>
          ) : (
            clientAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="mb-2 p-2 bg-white rounded border border-gray-200"
              >
                <p className="text-sm">
                  <span className="font-semibold">{appointment.data_agendamento}</span> às{' '}
                  {appointment.hora_agendamento} - {appointment.tipo_servico}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default ClientDetailsModal;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClients from '@hooks/useClients';
import useAppointments from '@hooks/useAppointments';
import { PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import CreateClientSidebar from '@components/clients/CreateClientSidebar';
import ScheduleAppointmentModal from '@components/appointments/ScheduleAppointmentModal';
import { Eye, Plus, Calendar } from 'lucide-react';

function ClientList() {
  const navigate = useNavigate();
  const { clients, isLoading } = useClients();
  const { appointments } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [schedulingClientId, setSchedulingClientId] = useState(null);

  const filteredClients = clients.filter((client) => {
    const nameMatch = client.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = client.telefone.includes(searchQuery);

    return nameMatch || phoneMatch;
  });

  function handleViewClick(clientId) {
    navigate(`/cliente/${clientId}`);
  }

  function handleScheduleClick(clientId) {
    setSchedulingClientId(clientId);
  }

  function closeModals() {
    setCreatingNew(false);
    setSchedulingClientId(null);
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Carregando clientes...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="mb-4">Nenhum cliente encontrado</p>
        <button
          onClick={() => setCreatingNew(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Criar Novo Cliente
        </button>
        {creatingNew && <CreateClientSidebar onClose={closeModals} />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setCreatingNew(true)}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr 0.5fr' }}>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo de Paciente</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Agendamentos</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ações</span>
          </div>
        </div>

        {/* Table Body */}
        {filteredClients.map((client) => {
          const clientAppointments = appointments.filter((apt) => apt.cliente_id === client.id);

          return (
            <div
              key={client.id}
              className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.2fr 1fr 0.5fr' }}>
                <span className="text-sm text-gray-900 font-medium truncate">{client.nome}</span>
                <span className="text-sm text-gray-600 truncate">{client.telefone}</span>
                <span className="text-sm text-gray-600 truncate">
                  {PATIENT_TYPE_LABELS[client.tipo_paciente] || client.tipo_paciente}
                </span>
                <button
                  onClick={() => handleScheduleClick(client.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                  title={`Ver ${clientAppointments.length} agendamento(s)`}
                >
                  <Calendar size={18} />
                  <span className="text-sm font-medium">{clientAppointments.length}</span>
                </button>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleViewClick(client.id)}
                    className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors p-1"
                    title="Visualizar cliente"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {creatingNew && (
        <CreateClientSidebar onClose={closeModals} />
      )}

      {schedulingClientId && (
        <ScheduleAppointmentModal
          clientId={schedulingClientId}
          onClose={closeModals}
        />
      )}
    </div>
  );
}

export default ClientList;

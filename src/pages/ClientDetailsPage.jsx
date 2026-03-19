import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useClients from '@hooks/useClients';
import useAppointments from '@hooks/useAppointments';
import { useData } from '@hooks/useData';
import { useDateInput } from '@hooks/useDateInput';
import { PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock } from 'lucide-react';
import AlertDialog from '@components/shared/AlertDialog';
import FormSidebar from '@components/shared/FormSidebar';

function ClientDetailsPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { fetchClientById, deleteClient, updateClient } = useClients();
  const { appointments } = useAppointments();
  const { cache, loadProfessionals, loadPatients, deletePatient } = useData();
  const birthDateEdit = useDateInput();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  useEffect(() => {
    loadProfessionals();
    loadPatients();
  }, [loadProfessionals, loadPatients]);

  async function loadClient() {
    const cachedPatient = cache.patients?.find((p) => p.id === clientId);

    if (cachedPatient) {
      setClient(cachedPatient);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const clientData = await fetchClientById(clientId);
    setClient(clientData);
    setIsLoading(false);
  }

  const professionals = cache.professionals || [];

  function handleEditClick() {
    setEditFormData({
      nome: client.nome || '',
      email: client.email || '',
      telefone: client.telefone || '',
    });
    birthDateEdit.setDate(client.data_nascimento || '');
    setShowEditSidebar(true);
  }

  async function handleSaveEdit() {
    setIsEditingSaving(true);
    try {
      await updateClient(clientId, {
        name: editFormData.nome,
        email: editFormData.email,
        phone: editFormData.telefone,
        birthDate: birthDateEdit.dateISO,
      });
      setClient({
        ...client,
        ...editFormData,
        data_nascimento: birthDateEdit.dateISO,
      });
      setShowEditSidebar(false);
    } finally {
      setIsEditingSaving(false);
    }
  }

  function handleDeleteClick() {
    setShowDeleteAlert(true);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteClient(clientId);
      deletePatient(clientId);
      navigate('/patients');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  }

  function formatDateTimePt(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('pt-BR', options);
  }

  function getProfessionalName(professionalId) {
    const professional = professionals.find((p) => p.id === professionalId);
    return professional ? `${professional.nome} - ${professional.especializacao}` : 'Profissional não informado';
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Carregando cliente...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cliente não encontrado
      </div>
    );
  }

  const clientAppointments = appointments.filter((apt) => apt.cliente_id === clientId);

  return (
    <>
      <AlertDialog
        isOpen={showDeleteAlert}
        title="Tem certeza que deseja deletar este paciente?"
        description="Esta ação não pode ser desfeita. Todos os dados do paciente serão permanentemente removidos do sistema."
        confirmLabel="Sim, deletar paciente"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteAlert(false)}
        isLoading={isDeleting}
        variant="danger"
      />

      <FormSidebar
        isOpen={showEditSidebar}
        onClose={() => setShowEditSidebar(false)}
        title="Editar Paciente"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              required
              value={editFormData.nome}
              onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="Nome do paciente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={editFormData.telefone}
              onChange={(e) => setEditFormData({ ...editFormData, telefone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="(19) 98917-4429"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento <span className="text-xs text-gray-500">(DD/MM/YYYY)</span>
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={birthDateEdit.dateDisplay}
              onChange={birthDateEdit.handleChange}
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isEditingSaving}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditingSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={() => setShowEditSidebar(false)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </FormSidebar>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 cursor-pointer transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para clientes
          </button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.nome}</h1>
              <p className="text-gray-600 mt-2">{client.telefone}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
              >
                <Edit size={18} />
                Editar
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
              >
                <Trash2 size={18} />
                Deletar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Pessoais</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900">{client.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Data de Nascimento</label>
                <p className="text-gray-900">{client.data_nascimento || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Tipo de Paciente</label>
                <p className="text-gray-900">{PATIENT_TYPE_LABELS[client.tipo_paciente] || client.tipo_paciente}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <p className="text-gray-900 capitalize">{client.status || '—'}</p>
              </div>
            </div>
          </div>

          {/* Agendamentos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Agendamentos ({clientAppointments.length})
            </h2>
            {clientAppointments.length === 0 ? (
              <p className="text-gray-600">Nenhum agendamento registrado</p>
            ) : (
              <div className="space-y-3">
                {clientAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-gray-900 font-medium mb-2">
                          <Clock size={16} className="text-blue-600" />
                          {formatDateTimePt(appointment.data_agendamento)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User size={16} className="text-gray-400" />
                          {getProfessionalName(appointment.profissional_id)}
                        </div>
                        {appointment.observacoes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{appointment.observacoes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Observações</h2>
          <p className="text-gray-900 whitespace-pre-wrap">
            {client.observacoes || '—'}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default ClientDetailsPage;

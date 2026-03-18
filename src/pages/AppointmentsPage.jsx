import { useState, useEffect } from 'react';
import { Plus, Clock, Trash2 } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import FormSidebar from '@components/shared/FormSidebar';
import CustomSelect from '@components/shared/CustomSelect';
import AlertDialog from '@components/shared/AlertDialog';
import * as appointmentsService from '@services/appointmentsService';
import * as clientsService from '@services/clientsService';
import * as professionalsService from '@services/professionalsService';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsResult, patientsResult, professionalsResult] = await Promise.all([
        appointmentsService.fetchAll(),
        clientsService.fetchAll(),
        professionalsService.fetchAll(),
      ]);
      setAppointments(appointmentsResult.data || []);
      setPatients(patientsResult.data || []);
      setProfessionals(professionalsResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const dateTime = `${formData.date}T${formData.time}:00`;
      await appointmentsService.create({
        clientId: formData.patient_id,
        professionalId: formData.professional_id,
        appointmentDate: dateTime,
        serviceType: formData.type,
        observations: formData.notes,
        status: 'pendente',
      });
      setFormData({ patient_id: '', professional_id: '', date: '', time: '', type: 'consultation', notes: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
    }
  };

  const handleDeleteAppointmentClick = (id) => {
    setAppointmentToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleConfirmDeleteAppointment = async () => {
    setIsDeleting(true);
    try {
      await appointmentsService.remove(appointmentToDelete);
      loadData();
      setShowDeleteAlert(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  const getPatientName = (clientId) => {
    return patients.find((p) => p.id === clientId)?.nome || 'Desconhecido';
  };


  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando agendamentos...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AlertDialog
        isOpen={showDeleteAlert}
        title="Tem certeza que deseja cancelar este agendamento?"
        description="Esta ação não pode ser desfeita. O agendamento será permanentemente removido do sistema."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteAppointment}
        onCancel={() => setShowDeleteAlert(false)}
        isLoading={isDeleting}
        variant="danger"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gestão de agendamentos e consultas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>

        {/* Add Appointment Sidebar */}
        <FormSidebar
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Novo Agendamento"
        >
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <CustomSelect
                value={formData.patient_id}
                onChange={(value) => setFormData({ ...formData, patient_id: value })}
                options={patients.map((patient) => ({
                  value: patient.id,
                  label: patient.nome,
                }))}
                placeholder="Selecione um paciente"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profissional *
              </label>
              <CustomSelect
                value={formData.professional_id}
                onChange={(value) => setFormData({ ...formData, professional_id: value })}
                options={professionals.map((professional) => ({
                  value: professional.id,
                  label: `${professional.nome} - ${professional.especializacao}`,
                }))}
                placeholder="Selecione um profissional"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Consulta
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="consultation">Consulta</option>
                <option value="treatment">Tratamento</option>
                <option value="cleaning">Limpeza</option>
                <option value="check">Check-up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Observações sobre o agendamento..."
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Salvar Agendamento
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </FormSidebar>

        {/* Appointments List */}
        <div className="grid grid-cols-1 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {appointments
                .filter((apt) => new Date(apt.data_agendamento) > new Date())
                .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento))
                .map((appointment) => (
                  <div key={appointment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold text-gray-900">{getPatientName(appointment.cliente_id)}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          {new Date(appointment.data_agendamento).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(appointment.data_agendamento).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block">
                          {appointment.tipo_servico === 'consultation' && 'Consulta'}
                          {appointment.tipo_servico === 'treatment' && 'Tratamento'}
                          {appointment.tipo_servico === 'cleaning' && 'Limpeza'}
                          {appointment.tipo_servico === 'check' && 'Check-up'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAppointmentClick(appointment.id)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} className="text-red-600" />
                        <span className="text-sm font-medium text-red-600">Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AppointmentsPage;

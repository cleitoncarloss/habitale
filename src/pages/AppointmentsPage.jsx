import { useState, useEffect } from 'react';
import { Plus, Clock, Trash2, Edit2 } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import FormSidebar from '@components/shared/FormSidebar';
import CustomSelect from '@components/shared/CustomSelect';
import AlertDialog from '@components/shared/AlertDialog';
import MenuButton from '@components/shared/MenuButton';
import { useData } from '@hooks/useData';
import { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS } from '@constants/appointmentTypes';
import * as appointmentsService from '@services/appointmentsService';

function formatDateToDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatDateToInput(displayStr) {
  if (!displayStr) return '';
  const parts = displayStr.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  if (!/^\d{2}$/.test(day) || !/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) return '';
  return `${year}-${month}-${day}`;
}

function maskDateInput(value) {
  const onlyNumbers = value.replace(/\D/g, '');

  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  }
  if (onlyNumbers.length <= 4) {
    return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
  }
  return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 4)}/${onlyNumbers.slice(4, 8)}`;
}

function maskTimeInput(value) {
  const onlyNumbers = value.replace(/\D/g, '');

  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  }
  return `${onlyNumbers.slice(0, 2)}:${onlyNumbers.slice(2, 4)}`;
}

function AppointmentsPage() {
  const { cache, loading, loadAppointments, loadPatients, loadProfessionals, addAppointment, updateAppointment, deleteAppointment } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: '',
    date: '',
    time: '',
    type: APPOINTMENT_TYPES.CLEANING,
    notes: '',
    notify_patient: true,
  });

  const [formDataDisplay, setFormDataDisplay] = useState({
    dateDisplay: '',
    timeDisplay: '',
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadProfessionals();
  }, [loadAppointments, loadPatients, loadProfessionals]);

  const appointments = cache.appointments || [];
  const patients = cache.patients || [];
  const professionals = cache.professionals || [];
  const isLoading = loading.appointments && !cache.appointments;

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dateTime = `${formData.date}T${formData.time}:00`;
      const result = await appointmentsService.create({
        clientId: formData.patient_id,
        professionalId: formData.professional_id,
        appointmentDate: dateTime,
        serviceType: formData.type,
        observations: formData.notes,
        status: 'pendente',
        notifyPatient: formData.notify_patient,
      });
      if (result.data) {
        addAppointment(result.data);
      }
      resetFormData();
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
    } finally {
      setIsSaving(false);
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
      deleteAppointment(appointmentToDelete);
      setShowDeleteAlert(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      patient_id: '',
      professional_id: '',
      date: '',
      time: '',
      type: APPOINTMENT_TYPES.CLEANING,
      notes: '',
      notify_patient: true,
    });
    setFormDataDisplay({
      dateDisplay: '',
      timeDisplay: '',
    });
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    resetFormData();
    setShowForm(true);
  };

  const handleDateDisplayChange = (e) => {
    const maskedDate = maskDateInput(e.target.value);
    setFormDataDisplay({ ...formDataDisplay, dateDisplay: maskedDate });

    const date = formatDateToInput(maskedDate);
    if (date) {
      setFormData({ ...formData, date });
    } else {
      setFormData({ ...formData, date: '' });
    }
  };

  const handleTimeDisplayChange = (e) => {
    const maskedTime = maskTimeInput(e.target.value);
    setFormDataDisplay({ ...formDataDisplay, timeDisplay: maskedTime });
    setFormData({ ...formData, time: maskedTime });
  };

  const handleEditAppointment = (appointment) => {
    const appointmentDateTime = new Date(appointment.data_agendamento);
    const date = appointmentDateTime.toISOString().split('T')[0];
    const time = appointmentDateTime.toTimeString().slice(0, 5);

    setFormData({
      patient_id: appointment.cliente_id,
      professional_id: appointment.profissional_id,
      date,
      time,
      type: appointment.tipo_servico,
      notes: appointment.observacoes || '',
      notify_patient: appointment.deve_notificar_1_dia || false,
    });

    setFormDataDisplay({
      dateDisplay: formatDateToDisplay(date),
      timeDisplay: time,
    });

    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (editingId) {
      await handleUpdateAppointment(e);
    } else {
      await handleAddAppointment(e);
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dateTime = `${formData.date}T${formData.time}:00`;
      await appointmentsService.update(editingId, {
        clientId: formData.patient_id,
        professionalId: formData.professional_id,
        appointmentDate: dateTime,
        serviceType: formData.type,
        observations: formData.notes,
        notifyPatient: formData.notify_patient,
      });
      updateAppointment(editingId, {
        cliente_id: formData.patient_id,
        profissional_id: formData.professional_id,
        data_agendamento: dateTime,
        tipo_servico: formData.type,
        observacoes: formData.notes,
        deve_notificar_1_dia: formData.notify_patient,
      });
      resetFormData();
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetFormData();
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
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-6">
          {/* Title and Subtitle */}
          <div className="flex-1">
            {/* Title Row with Menu */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-0">
              <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
              <div className="lg:hidden">
                <MenuButton />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mt-1">Gestão de agendamentos e consultas</p>
          </div>

          {/* Button Row */}
          <div className="flex gap-4 mt-4 lg:mt-0 lg:flex-shrink-0">
            <button
              onClick={handleOpenNewForm}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Novo Agendamento
            </button>
          </div>
        </div>

        {/* Add/Edit Appointment Sidebar */}
        <FormSidebar
          isOpen={showForm}
          onClose={handleCloseForm}
          title={editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
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
              <CustomSelect
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value })}
                options={Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => ({
                  value: value,
                  label: label,
                }))}
                placeholder="Selecione um tipo de consulta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data * <span className="text-xs text-gray-500">(DD/MM/YYYY)</span>
              </label>
              <input
                type="text"
                required
                placeholder="DD/MM/YYYY"
                value={formDataDisplay.dateDisplay}
                onChange={handleDateDisplayChange}
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  hover:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora * <span className="text-xs text-gray-500">(HH:MM)</span>
              </label>
              <input
                type="text"
                required
                placeholder="HH:MM"
                value={formDataDisplay.timeDisplay}
                onChange={handleTimeDisplayChange}
                maxLength="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  hover:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  hover:border-gray-400 transition-colors"
                rows="3"
                placeholder="Observações sobre o agendamento..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <input
                type="checkbox"
                id="notify_patient"
                checked={formData.notify_patient}
                onChange={(e) => setFormData({ ...formData, notify_patient: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="notify_patient" className="text-sm text-gray-700 cursor-pointer select-none">
                Notificar paciente 1 dia antes via WhatsApp
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Agendamento'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {APPOINTMENT_TYPE_LABELS[appointment.tipo_servico]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAppointmentClick(appointment.id)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">Excluir</span>
                        </button>
                      </div>
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

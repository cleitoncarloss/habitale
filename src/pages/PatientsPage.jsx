import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Phone, Mail } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import FormSidebar from '@components/shared/FormSidebar';
import MenuButton from '@components/shared/MenuButton';
import { useData } from '@hooks/useData';
import { useDateInput } from '@hooks/useDateInput';
import * as clientsService from '@services/clientsService';
import { maskPhoneInput } from '@utils/masks';

function PatientsPage() {
  const navigate = useNavigate();
  const { cache, loading, loadPatients, addPatient, updatePatient, deletePatient } = useData();
  const birthDate = useDateInput();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const patients = cache.patients || [];

  const handleOpenForm = () => {
    setEditingPatient(null);
    setFormData({ name: '', email: '', phone: '' });
    birthDate.setDate('');
    setShowForm(true);
  };


  const handleSavePatient = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPatient) {
        const updatedData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthDate: birthDate.dateISO,
        };
        await clientsService.update(editingPatient.id, updatedData);
        updatePatient(editingPatient.id, {
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone,
          data_nascimento: birthDate.dateISO,
        });
      } else {
        const result = await clientsService.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthDate: birthDate.dateISO,
        });
        if (result.data) {
          addPatient(result.data);
        }
      }
      setFormData({ name: '', email: '', phone: '' });
      birthDate.setDate('');
      setEditingPatient(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPatient = (patientId) => {
    navigate(`/cliente/${patientId}`);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telefone?.includes(searchTerm)
  );

  if (loading.patients && !cache.patients) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando pacientes...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-6">
          {/* Title and Subtitle */}
          <div className="flex-1">
            {/* Title Row with Menu */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-0">
              <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
              <div className="lg:hidden">
                <MenuButton />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mt-1">Gerencie o cadastro de pacientes da clínica</p>
          </div>

          {/* Button Row */}
          <div className="flex gap-4 mt-4 lg:mt-0 lg:flex-shrink-0">
            <button
              onClick={handleOpenForm}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Novo Paciente
            </button>
          </div>
        </div>

        {/* Add/Edit Patient Sidebar */}
        <FormSidebar
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
        >
          <form onSubmit={handleSavePatient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: maskPhoneInput(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                placeholder="(00) 00000-0000"
                maxLength="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento <span className="text-xs text-gray-500">(DD/MM/YYYY)</span>
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={birthDate.dateDisplay}
                onChange={birthDate.handleChange}
                maxLength="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : editingPatient ? 'Atualizar Paciente' : 'Salvar Paciente'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </FormSidebar>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
          />
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{patient.nome}</p>
                      {patient.telefone && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <Phone size={16} />
                          {patient.telefone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPatient(patient.id)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                      >
                        Ver Paciente
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              Nenhum paciente encontrado
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default PatientsPage;

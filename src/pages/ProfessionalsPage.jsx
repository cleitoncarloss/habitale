import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Mail, Briefcase } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import FormSidebar from '@components/shared/FormSidebar';
import MenuButton from '@components/shared/MenuButton';
import { useData } from '@hooks/useData';
import * as professionalsService from '@services/professionalsService';

function ProfessionalsPage() {
  const { cache, loading, loadProfessionals, addProfessional, updateProfessional, deleteProfessional } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    crm: '',
  });

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  const professionals = cache.professionals || [];

  const handleOpenNewForm = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', specialization: '', crm: '' });
    setShowForm(true);
  };

  const handleEditProfessional = (professional) => {
    setEditingId(professional.id);
    setFormData({
      name: professional.nome,
      email: professional.email || '',
      phone: professional.telefone || '',
      specialization: professional.especializacao,
      crm: professional.crm,
    });
    setShowForm(true);
  };

  const handleSubmitProfessional = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        crm: formData.crm,
        specialization: formData.specialization,
        email: formData.email,
        phone: formData.phone,
      };

      if (editingId) {
        await professionalsService.update(editingId, updateData);
        updateProfessional(editingId, {
          nome: formData.name,
          crm: formData.crm,
          especializacao: formData.specialization,
          email: formData.email,
          telefone: formData.phone,
        });
      } else {
        const result = await professionalsService.create(updateData);
        if (result.data) {
          addProfessional(result.data);
        }
      }
      setFormData({ name: '', email: '', phone: '', specialization: '', crm: '' });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfessional = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      try {
        await professionalsService.remove(id);
        deleteProfessional(id);
      } catch (error) {
        console.error('Erro ao deletar profissional:', error);
      }
    }
  };

  const filteredProfessionals = professionals.filter(
    (professional) =>
      professional.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.telefone?.includes(searchTerm) ||
      professional.especializacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading.professionals && !cache.professionals) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando profissionais...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
              <div className="lg:hidden">
                <MenuButton />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mt-1">Gerencie os profissionais da clínica</p>
          </div>

          {/* Button Row */}
          <div className="flex gap-4 mt-4 lg:mt-0 lg:flex-shrink-0">
            <button
              onClick={handleOpenNewForm}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Novo Profissional
            </button>
          </div>
        </div>

        {/* Add/Edit Professional Sidebar */}
        <FormSidebar
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? 'Editar Profissional' : 'Novo Profissional'}
        >
          <form onSubmit={handleSubmitProfessional} className="space-y-4">
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
                placeholder="Nome do profissional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CRM/CRO *
              </label>
              <input
                type="text"
                required
                value={formData.crm}
                onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                placeholder="12345/SP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialização *
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                placeholder="Ex: Ortodontia, Periodontia"
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
                placeholder="email@clinica.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                placeholder="(19) 98917-4429"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Profissional'}
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
            placeholder="Buscar por nome, especialização ou CRM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
          />
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.length > 0 ? (
            filteredProfessionals.map((professional) => (
              <div
                key={professional.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {professional.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                      <Briefcase size={16} />
                      {professional.especializacao}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditProfessional(professional)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfessional(professional.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">CRM:</span>
                    {professional.crm}
                  </div>
                  {professional.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      {professional.email}
                    </div>
                  )}
                  {professional.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      {professional.telefone}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhum profissional encontrado
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ProfessionalsPage;

import { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, Phone, ChevronRight, UserPlus, X } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import FormSidebar from '@components/shared/FormSidebar';
import MenuButton from '@components/shared/MenuButton';
import { useData } from '@hooks/useData';
import { useDateInput } from '@hooks/useDateInput';
import * as whatsappConversationsService from '@services/whatsappConversationsService';
import * as clientsService from '@services/clientsService';

function ConversationsPage() {
  const { cache, loading, loadConversations } = useData();
  const birthDate = useDateInput();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    phone: '',
    email: '',
    patientType: '',
    concern: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const conversations = cache.conversations || [];

  const loadMessages = async (conversation) => {
    try {
      setLoadingMessages(true);
      const result = await whatsappConversationsService.fetchMessagesByPhone(conversation.telefone);
      setMessages(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    return (
      conv.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.telefone?.includes(searchTerm) ||
      conv.assunto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        return 'bg-red-100 text-red-700';
      case 'em_progresso':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolvido':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'novo':
        return 'Novo';
      case 'em_progresso':
        return 'Em Progresso';
      case 'resolvido':
        return 'Resolvido';
      default:
        return status;
    }
  };

  const cleanPhoneNumber = (phone) => {
    return phone?.replace('@s.whatsapp.net', '') || '';
  };

  const handleConvertToPatient = () => {
    if (selectedConversation) {
      setPatientFormData({
        name: selectedConversation.nome_cliente || '',
        phone: cleanPhoneNumber(selectedConversation.telefone),
        email: '',
        patientType: '',
        concern: selectedConversation.assunto || '',
      });
      birthDate.setDate('');
      setShowPatientForm(true);
      setSuccessMessage('');
    }
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePatient = async () => {
    if (!patientFormData.name || !patientFormData.phone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    try {
      setSavingPatient(true);
      const result = await clientsService.create({
        ...patientFormData,
        birthDate: birthDate.dateISO,
      });

      if (result.error) {
        alert(`Erro ao criar paciente: ${result.error.message}`);
        return;
      }

      setSuccessMessage(`Paciente ${patientFormData.name} criado com sucesso!`);
      setShowPatientForm(false);
      setPatientFormData({
        name: '',
        phone: '',
        email: '',
        patientType: '',
        concern: '',
      });
      birthDate.setDate('');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      alert('Erro ao criar paciente');
    } finally {
      setSavingPatient(false);
    }
  };

  if (loading.conversations && !cache.conversations) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando conversas...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <span className="text-green-800">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="pb-6 flex-shrink-0">
          <div className="flex items-center justify-between lg:justify-start lg:gap-0">
            <h1 className="text-3xl font-bold text-gray-900">Conversas WhatsApp</h1>
            <div className="lg:hidden">
              <MenuButton />
            </div>
          </div>
          <p className="text-gray-600 mt-1">Histórico de conversas com pacientes via WhatsApp</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden">
          {/* Conversations List */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            {/* Search Bar */}
            <div className="relative pb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
              />
            </div>


            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 min-h-0 flex flex-col">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedConversation?.id === conversation.id
                          ? 'border-l-blue-500 bg-blue-50'
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {conversation.nome_cliente}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.assunto || 'Sem assunto'}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  Nenhuma conversa encontrada
                </div>
              )}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            {selectedConversation ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-0">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedConversation.nome_cliente}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {selectedConversation.assunto || 'Sem assunto'}
                      </p>
                    </div>
                    <button
                      onClick={handleConvertToPatient}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
                    >
                      <UserPlus size={18} />
                      <span className="text-sm font-medium">Tornar Paciente</span>
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {selectedConversation.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone size={16} />
                        {cleanPhoneNumber(selectedConversation.telefone)}
                      </span>
                    )}
                    {selectedConversation.created_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                  {loadingMessages ? (
                    <div className="text-center text-gray-500 py-8">
                      Carregando mensagens...
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.mensagem}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === 'user'
                                ? 'text-gray-600'
                                : 'text-blue-100'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Nenhuma mensagem nesta conversa
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4">
                  <p className="text-xs text-gray-600 text-center">
                    Conversa iniciada em{' '}
                    {new Date(selectedConversation.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para visualizar os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Form Sidebar */}
      <FormSidebar
        isOpen={showPatientForm}
        onClose={() => setShowPatientForm(false)}
        title="Novo Paciente"
        compact
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={patientFormData.name}
              onChange={handlePatientFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              value={patientFormData.phone}
              onChange={handlePatientFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="(11) 9999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={patientFormData.email}
              onChange={handlePatientFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Paciente
            </label>
            <input
              type="text"
              name="patientType"
              value={patientFormData.patientType}
              onChange={handlePatientFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg "
              placeholder="Ex: Novo, Retorno"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="concern"
              value={patientFormData.concern}
              onChange={handlePatientFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg  resize-none"
              rows="3"
              placeholder="Adicionar observações..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowPatientForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSavePatient}
              disabled={savingPatient}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPatient ? 'Salvando...' : 'Criar Paciente'}
            </button>
          </div>
        </form>
      </FormSidebar>
    </MainLayout>
  );
}

export default ConversationsPage;

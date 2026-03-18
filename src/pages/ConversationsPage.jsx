import { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, Phone, ChevronRight } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import * as whatsappConversationsService from '@services/whatsappConversationsService';

function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const result = await whatsappConversationsService.fetchConversationsFromHistory();
      console.log('Conversas carregadas:', result);
      setConversations(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
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
      <div className="flex flex-col h-[calc(100vh-240px)]">
        {/* Header */}
        <div className="pb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Conversas WhatsApp</h1>
          <p className="text-gray-600 mt-1">Histórico de conversas com pacientes via WhatsApp</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden pb-6">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedConversation.nome_cliente}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {selectedConversation.assunto || 'Sem assunto'}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {selectedConversation.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone size={16} />
                        {selectedConversation.telefone}
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
    </MainLayout>
  );
}

export default ConversationsPage;

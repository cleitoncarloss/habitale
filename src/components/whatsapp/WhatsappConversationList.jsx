import { useState } from 'react';
import useWhatsappConversations from '@hooks/useWhatsappConversations';
import { PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import WhatsappConversationDetailsModal from '@components/whatsapp/WhatsappConversationDetailsModal';
import { Eye } from 'lucide-react';

function WhatsappConversationList() {
  const { conversations, isLoading, error } = useWhatsappConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const filteredConversations = conversations.filter((conversation) => {
    const nameMatch = conversation.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = conversation.telefone.includes(searchQuery);

    return nameMatch || phoneMatch;
  });

  if (error) {
    return <div className="p-6 text-center text-red-600">Erro: {error}</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Carregando conversas...</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-6 text-center text-gray-600">Nenhuma conversa encontrada</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.5fr 0.5fr' }}>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo de Paciente</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ações</span>
          </div>
        </div>

        {/* Table Body */}
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition"
          >
            <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.5fr 0.5fr' }}>
              <span className="text-sm text-gray-900 font-medium truncate">{conversation.nome}</span>
              <span className="text-sm text-gray-600 truncate">{conversation.telefone}</span>
              <span className="text-sm text-gray-600 truncate">
                {PATIENT_TYPE_LABELS[conversation.tipo_paciente] || conversation.tipo_paciente || '—'}
              </span>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setSelectedConversation(conversation)}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors p-1"
                  title="Visualizar conversa"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedConversation && (
        <WhatsappConversationDetailsModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}

export default WhatsappConversationList;

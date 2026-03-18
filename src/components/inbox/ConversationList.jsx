import { useState } from 'react';
import useConversations from '@hooks/useConversations';
import ConversationDetailsModal from '@components/inbox/ConversationDetailsModal';
import ConvertToClientModal from '@components/inbox/ConvertToClientModal';
import { Eye, UserPlus } from 'lucide-react';

function ConversationList() {
  const { conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [convertingConversationId, setConvertingConversationId] = useState(null);

  const filteredConversations = conversations.filter((conversation) => {
    const nameMatch = conversation.nome_cliente.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = conversation.telefone_cliente.includes(searchQuery);

    return nameMatch || phoneMatch;
  });

  function handleViewDetails(conversationId) {
    setSelectedConversationId(conversationId);
  }

  function handleConvertClick(conversationId) {
    setConvertingConversationId(conversationId);
  }

  function closeModals() {
    setSelectedConversationId(null);
    setConvertingConversationId(null);
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
          <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.8fr 0.8fr' }}>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Telefone</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Última Mensagem</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ações</span>
          </div>
        </div>

        {/* Table Body */}
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition"
          >
            <div className="grid gap-6" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.8fr 0.8fr' }}>
              <span className="text-sm text-gray-900 font-medium truncate">{conversation.nome_cliente}</span>
              <span className="text-sm text-gray-600 truncate">{conversation.telefone_cliente}</span>
              <span className="text-sm text-gray-600 truncate">
                {conversation.duvida || '—'}
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleViewDetails(conversation.id)}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors p-1"
                  title="Visualizar conversa"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleConvertClick(conversation.id)}
                  className="text-green-600 hover:text-green-700 cursor-pointer transition-colors p-1"
                  title="Converter em cliente"
                >
                  <UserPlus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedConversationId && (
        <ConversationDetailsModal
          conversationId={selectedConversationId}
          onClose={closeModals}
        />
      )}

      {convertingConversationId && (
        <ConvertToClientModal
          conversationId={convertingConversationId}
          onClose={closeModals}
        />
      )}
    </div>
  );
}

export default ConversationList;

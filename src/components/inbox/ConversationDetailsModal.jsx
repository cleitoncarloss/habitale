import { useState, useEffect } from 'react';
import useConversations from '@hooks/useConversations';
import { X } from 'lucide-react';

function ConversationDetailsModal({ conversationId, onClose }) {
  const { fetchConversationMessages } = useConversations();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  async function loadMessages() {
    setIsLoading(true);
    const loadedMessages = await fetchConversationMessages(conversationId);
    setMessages(loadedMessages);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <p className="text-center text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Histórico da Conversa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-4 mb-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-600">Nenhuma mensagem</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 p-3 rounded ${
                  message.remetente === 'cliente'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{message.remetente}</p>
                <p>{message.conteudo}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConversationDetailsModal;

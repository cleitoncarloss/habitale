import { X } from 'lucide-react';

function parseConversa(conversa) {
  if (!conversa) return [];

  const segments = conversa.split(/(?=Usuário:|Assistente:)/);

  return segments
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('Usuário:')) {
        return { speaker: 'Usuário', text: trimmed.replace('Usuário:', '').trim() };
      }

      if (trimmed.startsWith('Assistente:')) {
        return { speaker: 'Assistente', text: trimmed.replace('Assistente:', '').trim() };
      }

      return { speaker: 'Desconhecido', text: trimmed };
    })
    .filter(Boolean);
}

function WhatsappConversationDetailsModal({ conversation, onClose }) {
  const messages = parseConversa(conversation.conversa);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Histórico da Conversa</h2>
            <p className="text-sm text-gray-500">{conversation.nome} · {conversation.telefone}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-4 mb-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-600">Nenhuma mensagem</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded ${
                  message.speaker === 'Usuário'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{message.speaker}</p>
                <p>{message.text}</p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default WhatsappConversationDetailsModal;

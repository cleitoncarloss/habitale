import { useState, useEffect } from 'react';
import useConversations from '@hooks/useConversations';
import useClients from '@hooks/useClients';
import { PATIENT_TYPES, PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import { maskPhoneInput } from '@utils/masks';
import { X } from 'lucide-react';

function ConvertToClientModal({ conversationId, onClose }) {
  const { conversations, updateConversationStatus } = useConversations();
  const { createClient } = useClients();

  const [conversation, setConversation] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [patientType, setPatientType] = useState(PATIENT_TYPES.FIRST_CONSULTATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const foundConversation = conversations.find((c) => c.id === conversationId);

    if (foundConversation) {
      setConversation(foundConversation);
      setFullName(foundConversation.nome_cliente);
      setPhone(maskPhoneInput(foundConversation.telefone_cliente));
      setPatientType(foundConversation.tipo_paciente || PATIENT_TYPES.FIRST_CONSULTATION);
    }
  }, [conversationId, conversations]);

  async function handleCreateClient(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!fullName || !phone) {
      setError('Nome e telefone são obrigatórios');
      setIsLoading(false);
      return;
    }

    const createdClient = await createClient({
      name: fullName,
      phone,
      email,
      patientType,
      concern: conversation?.duvida,
      conversationId,
    });

    if (!createdClient) {
      setError('Erro ao criar cliente');
      setIsLoading(false);
      return;
    }

    await updateConversationStatus(conversationId, 'finalizada');
    onClose();
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Converter em Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nome *</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Telefone *</label>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(maskPhoneInput(event.target.value))}
              placeholder="(00) 00000-0000"
              maxLength="15"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Paciente</label>
            <select
              value={patientType}
              onChange={(event) => setPatientType(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            >
              {Object.entries(PATIENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConvertToClientModal;

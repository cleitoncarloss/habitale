import { useState } from 'react';
import useClients from '@hooks/useClients';
import { PATIENT_TYPES, PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import { maskPhoneInput } from '@utils/masks';
import { X } from 'lucide-react';

function CreateClientModal({ onClose }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [patientType, setPatientType] = useState(PATIENT_TYPES.FIRST_CONSULTATION);
  const [concern, setConcern] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { createClient } = useClients();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!fullName || !phone || !patientType) {
      setError('Nome, telefone e tipo de paciente são obrigatórios');
      setIsLoading(false);
      return;
    }

    const newClient = await createClient({
      name: fullName,
      phone,
      email,
      birthDate,
      patientType,
      concern,
    });

    if (!newClient) {
      setError('Erro ao criar cliente');
      setIsLoading(false);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Criar Novo Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="(XX) XXXXX-XXXX"
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Data de Nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Paciente *</label>
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

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Dúvida/Observações</label>
            <textarea
              value={concern}
              onChange={(event) => setConcern(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows="3"
              disabled={isLoading}
            />
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClientModal;

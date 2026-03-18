import { useState, useEffect } from 'react';
import useClients from '@hooks/useClients';
import { PATIENT_TYPES, PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import { CLIENT_STATUSES } from '@constants/clientStatuses';
import { X } from 'lucide-react';

function EditClientModal({ clientId, onClose }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [patientType, setPatientType] = useState(PATIENT_TYPES.FIRST_CONSULTATION);
  const [concern, setConcern] = useState('');
  const [status, setStatus] = useState(CLIENT_STATUSES.NEW);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { fetchClientById, updateClient } = useClients();

  useEffect(() => {
    loadClient();
  }, [clientId]);

  async function loadClient() {
    setIsLoading(true);
    const client = await fetchClientById(clientId);

    if (client) {
      setFullName(client.nome);
      setPhone(client.telefone);
      setEmail(client.email || '');
      setBirthDate(client.data_nascimento || '');
      setPatientType(client.tipo_paciente || PATIENT_TYPES.FIRST_CONSULTATION);
      setConcern(client.observacoes || '');
      setStatus(client.status || CLIENT_STATUSES.NEW);
    }

    setIsLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    if (!fullName || !phone) {
      setError('Nome e telefone são obrigatórios');
      setIsSaving(false);
      return;
    }

    await updateClient(clientId, {
      name: fullName,
      phone,
      email,
      birthDate,
      patientType,
      concern,
      status,
    });

    setIsSaving(false);
    onClose();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <p className="text-center text-gray-600">Carregando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Editar Cliente</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Telefone *</label>
            <input
              type="text"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Data de Nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Paciente</label>
            <select
              value={patientType}
              onChange={(event) => setPatientType(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              {Object.entries(PATIENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              {Object.values(CLIENT_STATUSES).map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Dúvida/Observações</label>
            <textarea
              value={concern}
              onChange={(event) => setConcern(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={isSaving}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditClientModal;

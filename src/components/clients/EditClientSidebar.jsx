import { useState, useEffect } from 'react';
import useClients from '@hooks/useClients';
import { PATIENT_TYPES, PATIENT_TYPE_LABELS } from '@constants/patientTypes';
import { CLIENT_STATUSES } from '@constants/clientStatuses';
import { maskPhoneInput } from '@utils/masks';
import { X } from 'lucide-react';

function EditClientSidebar({ clientId, onClose }) {
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
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const { fetchClientById, updateClient } = useClients();

  useEffect(() => {
    setIsOpening(true);
  }, []);

  function handleClose() {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }

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
    handleClose();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'} ${!isOpening && 'opacity-0'}`}
          onClick={handleClose}
        />
        <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto transform transition-all duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'} ${!isOpening && 'translate-x-full'}`}>
          <div className="p-6 text-center text-gray-600">
            Carregando cliente...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'} ${!isOpening && 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-all duration-300 overflow-y-auto ${isClosing ? 'translate-x-full' : 'translate-x-0'} ${!isOpening && 'translate-x-full'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Editar Cliente</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nome *</label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={isSaving}
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
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Paciente</label>
              <select
                value={patientType}
                onChange={(event) => setPatientType(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
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
                className="w-full px-3 py-2 border border-gray-300 rounded"
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
                className="w-full px-3 py-2 border border-gray-300 rounded"
                rows="3"
                disabled={isSaving}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditClientSidebar;

import { useState, useEffect } from 'react';
import { Users, Calendar, MessageCircle } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import { useData } from '@hooks/useData';

function DashboardPage() {
  const { cache, loading, loadPatients, loadAppointments, loadConversations } = useData();

  useEffect(() => {
    loadPatients();
    loadAppointments();
    loadConversations();
  }, [loadPatients, loadAppointments, loadConversations]);

  const patients = cache.patients || [];
  const appointments = cache.appointments || [];
  const conversations = cache.conversations || [];

  const recentAppointments = appointments
    .filter((apt) => new Date(apt.data_agendamento) > new Date())
    .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento))
    .slice(0, 5);

  const stats = {
    patients: Array.isArray(patients) ? patients.length : 0,
    appointments: Array.isArray(appointments) ? appointments.length : 0,
    conversations: Array.isArray(conversations) ? conversations.length : 0,
  };

  const isLoading = (loading.patients || loading.appointments || loading.conversations) &&
    (!cache.patients || !cache.appointments || !cache.conversations);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  const getPatientName = (clientId, patients) => {
    return patients.find((p) => p.id === clientId)?.nome || 'Desconhecido';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo ao sistema de gerenciamento da clínica</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            label="Total de Pacientes"
            value={stats.patients}
            color="bg-blue-500"
          />
          <StatCard
            icon={Calendar}
            label="Agendamentos"
            value={stats.appointments}
            color="bg-green-500"
          />
          <StatCard
            icon={MessageCircle}
            label="Conversas WhatsApp"
            value={stats.conversations}
            color="bg-purple-500"
          />
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{getPatientName(appointment.cliente_id, patients)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(appointment.data_agendamento).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {appointment.status === 'pendente' ? 'Pendente' : 'Confirmado'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum agendamento próximo
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default DashboardPage;

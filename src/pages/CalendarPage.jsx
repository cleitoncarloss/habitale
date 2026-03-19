import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import MenuButton from '@components/shared/MenuButton';
import { useData } from '@hooks/useData';

function CalendarPage() {
  const { cache, loading, loadAppointments, loadPatients } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, [loadAppointments, loadPatients]);

  const appointments = cache.appointments || [];
  const patients = cache.patients || [];
  const isLoading = (loading.appointments || loading.patients) &&
    (!cache.appointments || !cache.patients);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const appointmentsInMonth = appointments.filter((apt) => {
    const aptDate = new Date(apt.data_agendamento);
    return (
      aptDate.getMonth() === currentMonth.getMonth() &&
      aptDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const getPatientName = (clientId) => {
    return patients.find((p) => p.id === clientId)?.nome || 'Desconhecido';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointmentsInMonth.filter((apt) => apt.data_agendamento.startsWith(dateStr));

      days.push(
        <div key={day} className="border border-gray-200 min-h-20 sm:min-h-24 p-1 sm:p-2">
          <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{day}</p>
          <div className="space-y-1 hidden sm:block">
            {dayAppointments.slice(0, 2).map((apt) => (
              <div key={apt.id} className="text-xs bg-blue-100 text-blue-700 p-1 rounded truncate">
                {getPatientName(apt.cliente_id)}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <p className="text-xs text-gray-500">+{dayAppointments.length - 2} mais</p>
            )}
          </div>
          {dayAppointments.length > 0 && (
            <div className="sm:hidden flex items-center justify-center">
              <span className="text-xs font-semibold bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {dayAppointments.length}
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 truncate">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
            <div key={day} className="bg-gray-100 p-1 sm:p-2 text-center font-semibold text-xs sm:text-sm text-gray-700">
              {day}
            </div>
          ))}
          {days}
        </div>

        {/* Mobile View - Appointments List */}
        <div className="sm:hidden mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Agendamentos de {monthNames[currentMonth.getMonth()]}
          </h4>
          {appointmentsInMonth.length > 0 ? (
            <div className="space-y-3">
              {appointmentsInMonth
                .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento))
                .map((apt) => (
                  <div key={apt.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-semibold text-gray-900">{getPatientName(apt.cliente_id)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(apt.data_agendamento).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(apt.data_agendamento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum agendamento neste mês</p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Carregando calendário...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between lg:justify-start lg:gap-0">
            <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
            <div className="lg:hidden">
              <MenuButton />
            </div>
          </div>
          <p className="text-gray-600 mt-1">Visualize e gerencie os agendamentos em formato de calendário</p>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderCalendar()}
        </div>
      </div>
    </MainLayout>
  );
}

export default CalendarPage;

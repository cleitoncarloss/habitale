import { useState } from 'react';
import useAppointments from '@hooks/useAppointments';
import useClients from '@hooks/useClients';
import { APPOINTMENT_STATUSES } from '@constants/appointmentTypes';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { appointments } = useAppointments();
  const { clients } = useClients();

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function formatDateForComparison(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function getAppointmentsForDate(date) {
    const dateStr = formatDateForComparison(date);

    return appointments.filter((apt) => apt.data_agendamento === dateStr);
  }

  function getStatusColor(status) {
    if (status === APPOINTMENT_STATUSES.CONFIRMED) return 'bg-green-500';
    if (status === APPOINTMENT_STATUSES.COMPLETED) return 'bg-blue-500';
    if (status === APPOINTMENT_STATUSES.CANCELLED) return 'bg-gray-500';

    return 'bg-gray-400';
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayLabels.map((label) => (
            <div key={label} className="text-center font-semibold text-gray-700 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayAppointments = getAppointmentsForDate(date);

            return (
              <div
                key={day}
                className="border border-gray-200 rounded p-2 min-h-24 bg-white hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-900 mb-1">{day}</p>
                <div className="space-y-1">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`${getStatusColor(appointment.status)} text-white text-xs rounded px-1 py-0.5 truncate`}
                    >
                      {appointment.hora_agendamento}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>Realizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            <span>Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentCalendar;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthentication from '@hooks/useAuthentication';
import { DataProvider } from '@contexts/DataContext';
import { SidebarProvider } from '@context/SidebarContext';
import { ROUTES } from '@constants/routes';
import LoginPage from '@pages/LoginPage';
import SignupPage from '@pages/SignupPage';
import DashboardPage from '@pages/DashboardPage';
import ClientDetailsPage from '@pages/ClientDetailsPage';
import PatientsPage from '@pages/PatientsPage';
import CalendarPage from '@pages/CalendarPage';
import AppointmentsPage from '@pages/AppointmentsPage';
import ConversationsPage from '@pages/ConversationsPage';
import ProfessionalsPage from '@pages/ProfessionalsPage';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthentication();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <DataProvider>
          <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PATIENTS}
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CALENDAR}
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.APPOINTMENTS}
          element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CONVERSATIONS}
          element={
            <ProtectedRoute>
              <ConversationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFESSIONALS}
          element={
            <ProtectedRoute>
              <ProfessionalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CLIENT_DETAILS}
          element={
            <ProtectedRoute>
              <ClientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
        </DataProvider>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;

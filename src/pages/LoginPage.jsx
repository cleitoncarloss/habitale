import LoginForm from '@components/auth/LoginForm';

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl px-14 py-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Habitale</h1>
        <p className="text-center text-gray-600 mb-8">Sistema de Gestão de Clínica</p>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;

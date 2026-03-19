import { useState } from 'react';
import useAuthentication from '@hooks/useAuthentication';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuthentication();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor preencha todos os campos');
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Email ou senha incorretos');
      setIsLoading(false);
      return;
    }

    navigate(ROUTES.DASHBOARD);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="seu.email@example.com"
          disabled={isLoading}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-gray-600 text-sm mt-4">
        Não tem conta?{' '}
        <Link to={ROUTES.SIGNUP} className="text-blue-600 hover:underline">
          Criar conta
        </Link>
      </p>

      {/* TODO: Implementar recuperação de senha
      <p className="text-center text-gray-600 text-sm mt-2">
        <Link to={ROUTES.PASSWORD_RECOVERY} className="text-blue-600 hover:underline">
          Esqueci a senha
        </Link>
      </p>
      */}
    </form>
  );
}

export default LoginForm;

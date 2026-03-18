import useAuthentication from '@hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';
import { LogOut } from 'lucide-react';

function Navbar() {
  const { user, signOut } = useAuthentication();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate(ROUTES.LOGIN);
  }

  const userEmail = user?.email || 'Usuário';

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Habitale</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

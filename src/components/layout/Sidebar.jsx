import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  Clock,
  MessageCircle,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { useContext } from 'react';
import supabase from '@services/supabaseClient';
import { SidebarContext } from '@context/SidebarContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, setIsOpen } = useContext(SidebarContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/patients' },
    { icon: Calendar, label: 'Calendário', path: '/calendar' },
    { icon: Clock, label: 'Agendamentos', path: '/appointments' },
    { icon: MessageCircle, label: 'Conversas', path: '/conversations' },
    { icon: UserCheck, label: 'Profissionais', path: '/professionals' },
  ];

  const isActive = (path) => location.pathname === path;

  const NavContent = () => (
    <>
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Habitale</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-40">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 h-screen">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

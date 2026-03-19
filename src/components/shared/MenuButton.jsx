import { useContext } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarContext } from '@context/SidebarContext';

function MenuButton() {
  const { isOpen, toggleSidebar } = useContext(SidebarContext);

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}

export default MenuButton;

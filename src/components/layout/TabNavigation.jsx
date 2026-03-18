import { MessageSquare, Users, MessageCircle } from 'lucide-react';

const TAB_INBOX = 'inbox';
const TAB_CLIENTS = 'clients';
const TAB_WHATSAPP = 'whatsapp';

function TabNavigation({ activeTab, onTabChange }) {
  function handleInboxClick() {
    onTabChange(TAB_INBOX);
  }

  function handleClientsClick() {
    onTabChange(TAB_CLIENTS);
  }

  function handleWhatsappClick() {
    onTabChange(TAB_WHATSAPP);
  }

  const inboxButtonClass = activeTab === TAB_INBOX
    ? 'border-b-2 border-blue-600 text-blue-600'
    : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900';

  const clientsButtonClass = activeTab === TAB_CLIENTS
    ? 'border-b-2 border-blue-600 text-blue-600'
    : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900';

  const whatsappButtonClass = activeTab === TAB_WHATSAPP
    ? 'border-b-2 border-blue-600 text-blue-600'
    : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900';

  const baseButtonClass = 'py-4 font-semibold flex items-center gap-2 cursor-pointer transition-colors';

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 flex gap-8">
        <button
          onClick={handleInboxClick}
          className={`${baseButtonClass} ${inboxButtonClass}`}
        >
          <MessageSquare size={20} />
          Inbox
        </button>
        <button
          onClick={handleClientsClick}
          className={`${baseButtonClass} ${clientsButtonClass}`}
        >
          <Users size={20} />
          Clientes
        </button>
        <button
          onClick={handleWhatsappClick}
          className={`${baseButtonClass} ${whatsappButtonClass}`}
        >
          <MessageCircle size={20} />
          WhatsApp
        </button>
      </div>
    </div>
  );
}

export { TAB_INBOX, TAB_CLIENTS, TAB_WHATSAPP };
export default TabNavigation;

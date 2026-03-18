import { CONVERSATION_STATUSES, STATUS_EMOJIS } from '@constants/conversationStatuses';
import { CLIENT_STATUSES, CLIENT_STATUS_EMOJIS } from '@constants/clientStatuses';

function StatusBadge({ status, statusType = 'conversation' }) {
  const emojiMap = statusType === 'conversation' ? STATUS_EMOJIS : CLIENT_STATUS_EMOJIS;
  const emoji = emojiMap[status] || '❓';

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
      {emoji} {status}
    </span>
  );
}

export default StatusBadge;

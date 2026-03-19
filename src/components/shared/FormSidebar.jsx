import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './FormSidebar.css';

function FormSidebar({ isOpen, onClose, title, children, compact = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Delay pequeno para garantir que o navegador veja a mudança de display antes de animar
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`form-sidebar-overlay ${isAnimating ? 'open' : 'closed'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`form-sidebar ${isAnimating ? 'open' : 'closed'} ${compact ? 'form-sidebar-compact' : ''}`}>
        {/* Header */}
        <div className="form-sidebar-header">
          <h2 className="form-sidebar-title">{title}</h2>
          <button
            onClick={onClose}
            className="form-sidebar-close-btn"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="form-sidebar-content">
          {children}
        </div>
      </div>
    </>
  );
}

export default FormSidebar;

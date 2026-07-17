import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="glass-modal rounded-xl w-full max-w-[480px] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
          <h2 className="text-xl font-semibold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

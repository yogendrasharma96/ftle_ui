function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden transition-transform animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Changed px-8 py-2 to provide consistent internal spacing */}
        <div className="max-h-[85vh] overflow-y-auto px-8 py-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
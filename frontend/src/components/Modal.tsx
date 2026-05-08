import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function Modal({ isOpen, onClose, title, children, onSubmit }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {onSubmit ? (
            <form id="modal-form" onSubmit={onSubmit}>
              {children}
            </form>
          ) : (
            <div>{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export function FormModal({ isOpen, onClose, title, onSubmit, children }: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} onSubmit={onSubmit}>
      <div className="space-y-4">{children}</div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="modal-form"
          className="px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/30"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}
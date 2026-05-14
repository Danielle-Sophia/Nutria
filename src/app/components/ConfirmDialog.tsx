import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle size={48} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={48} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle size={48} className="text-green-500" />;
      case 'info':
      default:
        return <Info size={48} className="text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'info':
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-[20px] shadow-2xl max-w-[450px] w-full p-[30px]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-[20px]">
                {getIcon()}
              </div>

              {/* Title */}
              <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-center text-black mb-[15px]">
                {title}
              </h3>

              {/* Message */}
              <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-center text-gray-700 mb-[30px]">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex gap-[15px]">
                <motion.button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[10px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {cancelText}
                </motion.button>

                <motion.button
                  onClick={handleConfirm}
                  className={`flex-1 ${getButtonColor()} text-white rounded-[10px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-colors`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

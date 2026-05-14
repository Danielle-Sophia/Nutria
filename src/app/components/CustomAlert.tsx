import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface CustomAlertProps {
  show: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function CustomAlert({ show, title, message, type = 'info', onClose }: CustomAlertProps) {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={32} className="text-[#00913f]" />;
      case 'error':
        return <XCircle size={32} className="text-[#d32f2f]" />;
      case 'warning':
        return <AlertCircle size={32} className="text-[#f2e307]" />;
      default:
        return <Info size={32} className="text-[#39588a]" />;
    }
  };

  const getColorScheme = () => {
    switch (type) {
      case 'success':
        return 'border-[#00913f] bg-[#e8f5e9]';
      case 'error':
        return 'border-[#d32f2f] bg-[#ffebee]';
      case 'warning':
        return 'border-[#f2e307] bg-[#fffde7]';
      default:
        return 'border-[#39588a] bg-[#e3f2fd]';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white rounded-[20px] shadow-2xl max-w-[500px] w-[90%] border-4 ${getColorScheme()} overflow-hidden`}>
        {/* Header */}
        <div className="bg-[#193073] px-[30px] py-[20px]">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[24px] text-white">
            Nutr<span className="text-[#8db9f2]">IA</span>
          </h2>
        </div>

        {/* Content */}
        <div className="p-[30px]">
          <div className="flex items-start gap-[20px] mb-[25px]">
            {getIcon()}
            <div className="flex-1">
              {title && (
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[10px]">
                  {title}
                </h3>
              )}
              <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-black leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[10px] px-[30px] py-[12px] font-['Poppins:SemiBold',sans-serif] text-[16px] transition-all active:scale-95"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar las alertas
export function useCustomAlert() {
  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    return new Promise<void>((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const handleClose = () => {
        document.body.removeChild(container);
        resolve();
      };

      const root = (window as any).__REACT_ROOT__ || (window as any).__root__;
      if (root) {
        const { createRoot } = require('react-dom/client');
        const alertRoot = createRoot(container);
        alertRoot.render(
          <CustomAlert
            title={title}
            message={message}
            type={type}
            onClose={handleClose}
          />
        );
      }
    });
  };

  return { showAlert };
}
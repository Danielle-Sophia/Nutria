import { useRef, useEffect, useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from './ConfirmDialog';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleConfiguration = () => {
    onClose();
    navigate('/configuracion');
  };

  const handleLogoutClick = () => {
    onClose();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    navigate('/');
    toast.success('Sesión cerrada exitosamente', {
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
        color: '#155724',
        border: '1px solid #c3e6cb',
      },
      iconTheme: {
        primary: '#28a745',
        secondary: '#fff',
      },
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            className="absolute right-[60px] top-[75px] z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Arrow/Triangle pointing up */}
            <motion.div
              className="absolute right-[5px] -top-[13.5px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <svg width="36.37" height="13.5" viewBox="0 0 36.37 13.5" fill="none">
                <path d="M18.1865 0L36.3731 13.5H0L18.1865 0Z" fill="#E1E9F2" />
              </svg>
            </motion.div>

            {/* Menu Container */}
            <div className="bg-[#E1E9F2] rounded-[15px] w-[215px] shadow-xl">
              {/* Configuración Option */}
              <motion.button
                onClick={handleConfiguration}
                className="w-full px-[24px] py-[18px] flex items-center gap-[12px] hover:bg-[#d0dde8] transition-colors rounded-t-[15px] group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Settings size={24} className="text-black group-hover:text-[#3457bf] transition-colors" />
                <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black group-hover:text-[#3457bf] transition-colors">
                  Configuración
                </p>
              </motion.button>

              {/* Divider */}
              <div className="h-[1px] bg-[#c0cdd9] mx-[20px]" />

              {/* Cerrar Sesión Option */}
              <motion.button
                onClick={handleLogoutClick}
                className="w-full px-[24px] py-[18px] flex items-center gap-[12px] hover:bg-[#d0dde8] transition-colors rounded-b-[15px] group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <LogOut size={24} className="text-black group-hover:text-[#d32f2f] transition-colors" />
                <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black group-hover:text-[#d32f2f] transition-colors">
                  Cerrar Sesión
                </p>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        type="warning"
      />
    </>
  );
}
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Settings } from 'lucide-react';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  const handleConfiguration = () => {
    onClose();
    alert('Funcionalidad de Configuración en desarrollo');
  };

  const handleLogout = () => {
    onClose();
    // Confirm logout
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      navigate('/');
    }
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-[60px] top-[75px] z-50"
    >
      {/* Arrow/Triangle pointing up */}
      <div className="absolute right-[5px] -top-[13.5px]">
        <svg width="36.37" height="13.5" viewBox="0 0 36.37 13.5" fill="none">
          <path d="M18.1865 0L36.3731 13.5H0L18.1865 0Z" fill="#E1E9F2" />
        </svg>
      </div>

      {/* Menu Container */}
      <div className="bg-[#E1E9F2] rounded-[15px] w-[215px] shadow-lg">
        {/* Configuración Option */}
        <button
          onClick={handleConfiguration}
          className="w-full px-[24px] py-[18px] flex items-center gap-[12px] hover:bg-[#d0dde8] transition-colors rounded-t-[15px] group"
        >
          <Settings size={24} className="text-black group-hover:text-[#3457bf]" />
          <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black group-hover:text-[#3457bf]">
            Configuración
          </p>
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-[#c0cdd9] mx-[20px]" />

        {/* Cerrar Sesión Option */}
        <button
          onClick={handleLogout}
          className="w-full px-[24px] py-[18px] flex items-center gap-[12px] hover:bg-[#d0dde8] transition-colors rounded-b-[15px] group"
        >
          <LogOut size={24} className="text-black group-hover:text-[#d32f2f]" />
          <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black group-hover:text-[#d32f2f]">
            Cerrar Sesión
          </p>
        </button>
      </div>
    </div>
  );
}

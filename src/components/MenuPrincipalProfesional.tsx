import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ProfileMenu } from './ProfileMenu';
import { WelcomeSection } from './WelcomeSection';
import { getUserData } from '../utils/api';
import imgLifesaversNewPatient from "figma:asset/8d4c75af8bdd5521ebb3ccb7852724c6e92c2782.png";
import imgLifesaversUsingComputer from "figma:asset/0f8d6bd54bbc2235127b830c3e7fadd1652447df.png";
import imgLifesaversStudyOnline from "figma:asset/661e850e5bbc3a2800f0efb364ea3899adfa1b3b.png";
import imgLifesaversCardId from "figma:asset/d1a8920dee1b525f3439c3bc0b3aaab8d5ed028a.png";

interface MenuCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

function MenuCard({ title, image, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="h-[262px] w-[266px] group cursor-pointer transition-transform hover:scale-105 active:scale-95"
    >
      <div className="relative h-full w-full">
        {/* Gray background card */}
        <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px] group-hover:bg-[#d0dde8] transition-colors" />
        
        {/* Blue header bar */}
        <div className="absolute left-0 top-0 w-[266px]">
          <div className="bg-[#3457bf] h-[41px] rounded-[5px] w-full group-hover:bg-[#2a46a0] transition-colors" />
          <p className="absolute -translate-x-1/2 font-['Poppins:Regular',sans-serif] leading-[normal] left-[133px] not-italic text-[18px] text-center text-white text-nowrap top-[8px]">
            {title}
          </p>
        </div>
        
        {/* Image container - centered in gray card */}
        <div className="absolute h-[173px] left-[20px] top-[59px] w-[225px] flex items-center justify-center">
          <img alt={title} className="max-w-full max-h-full object-contain pointer-events-none" src={image} />
        </div>
      </div>
    </button>
  );
}

export function MenuPrincipalProfesional() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const [professionalData, setProfessionalData] = useState({
    nombre: 'Profesional',
    apellidos: '',
    especialidad: 'Nutrición Clínica',
    folio: '',
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = getUserData();
    if (userData) {
      setProfessionalData({
        nombre: userData.nombre || 'Profesional',
        apellidos: userData.apellidos || '',
        especialidad: userData.especialidad || 'Nutrición Clínica',
        folio: userData.folio || '',
      });
    } else {
      // If no user data, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const handleSearch = () => {
    console.log('Búsqueda activada');
    toast('Función de búsqueda en desarrollo', {
      icon: '🔍',
      duration: 3000,
      style: {
        background: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      },
    });
  };

  const handleNotifications = () => {
    console.log('Notificaciones activadas');
    toast('Notificaciones en desarrollo', {
      icon: '🔔',
      duration: 3000,
      style: {
        background: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      },
    });
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const fullName = `${professionalData.nombre} ${professionalData.apellidos}`.trim();

  return (
    <div className="bg-[#85aab3] min-h-screen w-full relative">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          {/* Logo */}
          <button 
            onClick={() => navigate('/menu-profesional')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          {/* Center Text */}
          <button
            onClick={() => navigate('/mis-pacientes')}
            className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[18px] text-center text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
          >
            Mis pacientes
          </button>
          
          {/* Icons */}
          <div className="flex items-center gap-[25px]">
            <button 
              onClick={handleSearch}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              <Search size={30} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleNotifications}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell size={30} strokeWidth={2.5} />
            </button>
            <button 
              onClick={toggleProfileMenu}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Perfil de usuario"
            >
              <User size={30} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-[40px] w-[90%] max-w-[1225px] p-[40px] relative">
          {/* Welcome Section */}
          <div className="mb-[60px]">
            <WelcomeSection 
              nombre={fullName}
              especialidad={professionalData.especialidad}
            />
          </div>
          
          {/* Menu Section */}
          <div>
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black mb-[30px]">
              ¿Qué deseas consultar hoy?
            </p>
            
            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px] justify-items-center">
              <MenuCard 
                title="Px registrados" 
                image={imgLifesaversNewPatient}
                onClick={() => handleCardClick('/mis-pacientes')}
              />
              <MenuCard 
                title="Expedientes" 
                image={imgLifesaversUsingComputer}
                onClick={() => handleCardClick('/expedientes')}
              />
              <MenuCard 
                title="Tablas de evolución" 
                image={imgLifesaversStudyOnline}
                onClick={() => handleCardClick('/tablas-evolucion')}
              />
              <MenuCard 
                title="Configuración" 
                image={imgLifesaversCardId}
                onClick={() => handleCardClick('/configuracion')}
              />
            </div>
          </div>
        </div>
        
        {/* Profile Menu */}
        <ProfileMenu 
          isOpen={isProfileMenuOpen} 
          onClose={() => setIsProfileMenuOpen(false)} 
        />
      </div>
    </div>
  );
}
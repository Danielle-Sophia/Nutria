import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
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
  index: number;
}

function MenuCard({ title, image, onClick, index }: MenuCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="h-[262px] w-[266px] group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative h-full w-full">
        {/* Gray background card */}
        <div className="absolute bg-[#e1e9f2] h-[241px] left-0 rounded-[10px] top-[21px] w-[266px] group-hover:bg-[#d0dde8] transition-colors shadow-md group-hover:shadow-xl" />

        {/* Blue header bar with gradient */}
        <div className="absolute left-0 top-0 w-[266px]">
          <div className="bg-gradient-to-r from-[#3457bf] to-[#2a46a0] h-[41px] rounded-[5px] w-full group-hover:from-[#2a46a0] group-hover:to-[#1e347a] transition-all shadow-md" />
          <p className="absolute -translate-x-1/2 font-[Poppins] font-medium leading-[normal] left-[133px] not-italic text-[18px] text-center text-white text-nowrap top-[8px]">
            {title}
          </p>
        </div>

        {/* Image container - centered in gray card */}
        <motion.div
          className="absolute h-[173px] left-[20px] top-[59px] w-[225px] flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <img alt={title} className="max-w-full max-h-full object-contain pointer-events-none" src={image} />
        </motion.div>
      </div>
    </motion.button>
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
    profilePicture: '',
    pronombres: '',
    sexoBiologico: '',
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
        profilePicture: userData.profilePicture || '',
        pronombres: userData.pronombres || '',
        sexoBiologico: userData.sexoBiologico || '',
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
    <motion.div
      className="bg-gradient-to-br from-[#85aab3] to-[#6a8f98] min-h-screen w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-gradient-to-r from-[#193073] to-[#2a4580] h-[60px] w-full flex items-center justify-between px-[60px] shadow-lg">
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
            className="font-[Poppins] font-medium leading-[normal] not-italic text-[18px] text-center text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
          >
            Mis pacientes
          </button>
          
          {/* Icons */}
          <div className="flex items-center gap-[25px]">
            <motion.button
              onClick={handleSearch}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Buscar"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={30} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              onClick={handleNotifications}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer relative"
              aria-label="Notificaciones"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <Bell size={30} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              onClick={toggleProfileMenu}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Perfil de usuario"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={30} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] flex justify-center items-center min-h-screen">
        <motion.div
          className="bg-white rounded-[40px] w-[90%] max-w-[1225px] p-[40px] relative shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Welcome Section */}
          <div className="mb-[60px]">
            <WelcomeSection
              nombre={fullName}
              especialidad={professionalData.especialidad}
              folio={professionalData.folio}
              profilePicture={professionalData.profilePicture}
              pronombres={professionalData.pronombres}
              sexoBiologico={professionalData.sexoBiologico}
            />
          </div>
          
          {/* Menu Section */}
          <div>
            <p className="font-[Poppins] font-medium leading-[normal] not-italic text-[20px] text-black mb-[30px]">
              ¿Qué deseas consultar hoy?
            </p>
            
            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px] justify-items-center">
              <MenuCard
                title="Px registrados"
                image={imgLifesaversNewPatient}
                onClick={() => handleCardClick('/mis-pacientes')}
                index={0}
              />
              <MenuCard
                title="Expedientes"
                image={imgLifesaversUsingComputer}
                onClick={() => handleCardClick('/expedientes')}
                index={1}
              />
              <MenuCard
                title="Tablas de evolución"
                image={imgLifesaversStudyOnline}
                onClick={() => handleCardClick('/tablas-evolucion')}
                index={2}
              />
              <MenuCard
                title="Configuración"
                image={imgLifesaversCardId}
                onClick={() => handleCardClick('/configuracion')}
                index={3}
              />
            </div>
          </div>
        </motion.div>
        
        {/* Profile Menu */}
        <ProfileMenu
          isOpen={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
        />
      </div>
    </motion.div>
  );
}
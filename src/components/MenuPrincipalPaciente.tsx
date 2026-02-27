import { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProfileMenu } from './ProfileMenu';
import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";
import imgFoodiesMealIngredients from "figma:asset/ab1a1cb53499fd7537e3427b3dd57bc7c74b57ed.png";
import imgCoolKidsOnWheels from "figma:asset/84a8a89c1913a34f01f581c6a7cd48d9c2cd1445.png";
import imgLifesaversHand from "figma:asset/a359c166e3c6c52ae6fba315f1afeac60968b39e.png";
import imgCoolKidsAloneTime from "figma:asset/a19df1aeeeaa40b6e7abaeada2a62b68f64ac612.png";

interface MenuCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

function MenuCard({ title, image, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="h-[182px] w-[266px] group cursor-pointer transition-transform hover:scale-105 active:scale-95"
    >
      <div className="relative h-full w-full">
        {/* Gray background card */}
        <div className="absolute bg-[#f2f2f2] h-[141px] left-0 rounded-[10px] top-[41px] w-[266px] group-hover:bg-[#e5e5e5] transition-colors" />
        
        {/* Blue header bar */}
        <div className="absolute left-0 top-0 w-[266px]">
          <div className="bg-[#3457bf] h-[41px] rounded-[5px] w-full group-hover:bg-[#2a46a0] transition-colors" />
          <p className="absolute -translate-x-1/2 font-['Poppins:Regular',sans-serif] leading-[normal] left-[132px] not-italic text-[16px] text-center text-white top-[9px] whitespace-nowrap px-2">
            {title}
          </p>
        </div>
        
        {/* Image container - centered in gray card */}
        <div className="absolute h-[127px] left-[50px] top-[48px] w-[165px] flex items-center justify-center">
          <img alt={title} className="max-w-full max-h-full object-contain pointer-events-none" src={image} />
        </div>
      </div>
    </button>
  );
}

interface GlucoseLevel {
  label: string;
  range: string;
  color: string;
}

const glucoseLevels: GlucoseLevel[] = [
  { label: 'Muy alto', range: '>250 mg/dL', color: '#ff8000' },
  { label: 'Alta', range: '181 - 249 mg/dL', color: '#f2e307' },
  { label: 'Rango objetivo', range: '181 - 249 mg/dL', color: '#00913f' },
  { label: 'Baja', range: '54 - 69 mg/dL', color: '#8c0303' },
  { label: 'Muy baja', range: '< 54 mg/dL', color: '#590202' },
];

export function MenuPrincipalPaciente() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const [patientData] = useState({
    nombre: 'Patricio Castillo Antonio',
    folio: '000001'
  });

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  const handleSearch = () => {
    console.log('Búsqueda activada');
    alert('Función de búsqueda en desarrollo');
  };

  const handleNotifications = () => {
    console.log('Notificaciones activadas');
    alert('Notificaciones en desarrollo');
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <div className="bg-[#85aab3] min-h-screen w-full relative">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[80px] w-full flex items-center justify-between px-[60px]">
          {/* Logo */}
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[40px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          {/* Icons */}
          <div className="flex items-center gap-[30px]">
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
      <div className="pt-[100px] pb-[40px] flex justify-center items-start min-h-screen">
        <div className="bg-white rounded-[40px] w-[90%] max-w-[1225px] p-[40px] relative">
          {/* Welcome Section */}
          <div className="flex items-center gap-[35px] mb-[30px]">
            {/* Avatar */}
            <div className="h-[208px] w-[221px] flex-shrink-0">
              <img 
                alt="Avatar paciente" 
                className="w-full h-full object-contain" 
                src={imgAvatarsDefaultWithBackdrop} 
              />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <p className="font-['Poppins:Bold',sans-serif] leading-[normal] not-italic text-[#7f94e2] text-[32px] mb-[20px]">
                ¡Bienvenido!
              </p>
              <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[8px]">
                {patientData.nombre}
              </p>
              <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black">
                Folio: {patientData.folio}
              </p>
            </div>
          </div>

          {/* Important Actions Section */}
          <div className="mb-[25px]">
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black mb-[15px]">
              Acciones importantes:
            </p>
            <div className="flex gap-[18px]">
              <button
                onClick={() => handleActionClick('/sincronizar-sensor')}
                className="bg-[#39588a] hover:bg-[#2a4266] transition-colors h-[37px] rounded-[15px] px-[30px] font-['Poppins:Regular',sans-serif] text-[18px] text-white"
              >
                Sincronizar sensor
              </button>
              <button
                onClick={() => handleActionClick('/agendar-cita')}
                className="bg-[#39588a] hover:bg-[#2a4266] transition-colors h-[37px] rounded-[15px] px-[30px] font-['Poppins:Regular',sans-serif] text-[18px] text-white"
              >
                Agendar cita
              </button>
            </div>
          </div>

          {/* Registration Section */}
          <div className="mb-[30px]">
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black mb-[20px]">
              ¿Tienes algo que registrar hoy?
            </p>
            
            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px] justify-items-center">
              <MenuCard 
                title="Alimentos" 
                image={imgFoodiesMealIngredients}
                onClick={() => handleCardClick('/alimentos')}
              />
              <MenuCard 
                title="Actividad física" 
                image={imgCoolKidsOnWheels}
                onClick={() => handleCardClick('/actividad-fisica')}
              />
              <MenuCard 
                title="Glucosa" 
                image={imgLifesaversHand}
                onClick={() => handleCardClick('/glucosa')}
              />
              <MenuCard 
                title="Síntomas" 
                image={imgCoolKidsAloneTime}
                onClick={() => handleCardClick('/sintomas')}
              />
            </div>
          </div>

          {/* Evolution Tables Section */}
          <div>
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black mb-[20px]">
              Tablas de evolución (últimos 14 días)
            </p>
            
            <div className="flex gap-[30px]">
              {/* Chart Container */}
              <div className="flex-1 bg-[#d9d9d9] rounded-[20px] p-[20px]">
                <div className="bg-white rounded-[10px] p-[20px] h-[400px] flex items-center justify-center">
                  <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500 italic text-center">
                    Gráfica de evolución de glucosa
                    <br />
                    (Datos en desarrollo)
                  </p>
                </div>
              </div>

              {/* Glucose Levels Legend */}
              <div>
                <p className="font-['Poppins:Bold',sans-serif] text-[18px] text-black mb-[15px]">
                  Niveles de glucosa
                </p>
                <div className="flex gap-[15px]">
                  {/* Color bars */}
                  <div className="w-[98px] h-[303px] rounded-[10px] overflow-hidden flex flex-col">
                    <div className="bg-[#ff8000] h-[30px]" />
                    <div className="bg-[#f2e307] h-[70px]" />
                    <div className="bg-[#00913f] h-[110px]" />
                    <div className="bg-[#8c0303] h-[16px]" />
                    <div className="bg-[#590202] h-[77px]" />
                  </div>
                  
                  {/* Labels */}
                  <div className="flex flex-col justify-between h-[303px] py-[5px]">
                    {glucoseLevels.map((level, index) => (
                      <div key={index}>
                        <p className="font-['Poppins:Bold',sans-serif] text-[18px] text-black leading-tight">
                          {level.label}
                        </p>
                        <p className="font-['Poppins:Regular',sans-serif] text-[10px] text-black">
                          {level.range}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
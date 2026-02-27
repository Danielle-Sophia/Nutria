import { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { ProfileMenu } from './ProfileMenu';
import { IdentificacionPaciente } from './expediente/IdentificacionPaciente';
import { HistoriaClinica } from './expediente/HistoriaClinica';
import { AnalisisYReportes } from './expediente/AnalisisYReportes';

type SectionType = 'identificacion' | 'historia' | 'bitacora' | 'analisis' | 'seguimiento' | 'documentos' | 'seguridad';

interface MenuItem {
  id: SectionType;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: 'identificacion', label: 'Identificación del paciente' },
  { id: 'historia', label: 'Historia clínica' },
  { id: 'bitacora', label: 'Bitácora' },
  { id: 'analisis', label: 'Análisis y reportes' },
  { id: 'seguimiento', label: 'Seguimiento' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'seguridad', label: 'Seguridad y registro de actividad' },
];

// Mock patient data
const mockPatients = [
  { 
    id: 1, 
    nombre: 'Patricio Castillo Antonio', 
    folio: '000001',
    fechaNacimiento: '15/09/1997',
    sexoBiologico: 'Hombre',
    telefono: '55-55555555',
    correo: 'patricio_castillo_97@mail.com',
    direccion: 'Calle Manzana, Lt. 1, Mz 1. Colonia Bonita colonia. Ciudad Manzana. México. México'
  },
  { 
    id: 2, 
    nombre: 'Margarita Muñoz López', 
    folio: '000002',
    fechaNacimiento: '22/03/2006',
    sexoBiologico: 'Mujer',
    telefono: '55-11111111',
    correo: 'margarita@email.com',
    direccion: 'Calle Principal 123, Col. Centro, Ciudad de México'
  },
  { 
    id: 3, 
    nombre: 'Alejandra Cortes Pérez', 
    folio: '000003',
    fechaNacimiento: '10/07/1995',
    sexoBiologico: 'Mujer',
    telefono: '55-22222222',
    correo: 'alejandra@email.com',
    direccion: 'Av. Reforma 456, Col. Juárez, Ciudad de México'
  },
];

export function Expediente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState<SectionType>('identificacion');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Get patient data based on ID
  const patient = mockPatients.find(p => p.id === Number(id)) || mockPatients[0];

  const handleSearch = () => {
    console.log('Búsqueda activada');
  };

  const handleNotifications = () => {
    console.log('Notificaciones activadas');
    alert('Notificaciones en desarrollo');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'identificacion':
        return <IdentificacionPaciente patient={patient} />;
      case 'historia':
        return <HistoriaClinica patient={patient} />;
      case 'bitacora':
        return (
          <div className="p-[20px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-600 italic">
              Bitácora en desarrollo
            </p>
          </div>
        );
      case 'analisis':
        return <AnalisisYReportes patient={patient} />;
      case 'seguimiento':
        return (
          <div className="p-[20px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-600 italic">
              Seguimiento en desarrollo
            </p>
          </div>
        );
      case 'documentos':
        return (
          <div className="p-[20px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-600 italic">
              Documentos en desarrollo
            </p>
          </div>
        );
      case 'seguridad':
        return (
          <div className="p-[20px]">
            <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-600 italic">
              Seguridad y registro de actividad en desarrollo
            </p>
          </div>
        );
      default:
        return null;
    }
  };

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
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              aria-label="Perfil de usuario"
            >
              <User size={30} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Profile Menu */}
        <ProfileMenu 
          isOpen={isProfileMenuOpen} 
          onClose={() => setIsProfileMenuOpen(false)} 
        />
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] px-[60px] flex gap-0">
        {/* White Container */}
        <div className="bg-white rounded-[40px] w-full flex overflow-hidden min-h-[1040px]">
          {/* Left Sidebar Menu */}
          <div className="bg-[#e1e9f2] w-[360px] flex-shrink-0 rounded-br-[25px] rounded-tr-[25px] pt-[45px] pb-[40px]">
            <p className="font-['Poppins:Bold',sans-serif] text-[30px] text-black px-[40px] mb-[75px]">
              Expediente
            </p>
            
            {/* Menu Items */}
            <div className="space-y-0">
              {menuItems.map((item, index) => (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full px-[40px] py-[20px] text-center transition-colors ${
                      activeSection === item.id
                        ? 'text-[#458dff] font-["Poppins:Medium",sans-serif]'
                        : 'text-black font-["Poppins:Medium",sans-serif] hover:text-[#458dff]'
                    }`}
                  >
                    <p className="text-[20px] leading-tight">
                      {item.label}
                    </p>
                  </button>
                  {index < menuItems.length - 1 && (
                    <div className="h-px bg-[#3457bf] mx-[10px]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
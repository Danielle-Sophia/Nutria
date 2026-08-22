import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Search, Bell, User, Menu, ClipboardList, Clock, Activity, CalendarDays, FolderPlus, Lock, Salad } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProfileMenu } from './ProfileMenu';
import { IdentificacionPaciente } from './expediente/IdentificacionPaciente';
import { HistoriaClinica } from './expediente/HistoriaClinica';
import { HistoriaNutriologica } from './expediente/HistoriaNutriologica';
import { AnalisisYReportes } from './expediente/AnalisisYReportes';
import { patientAPI } from '../utils/api';

type SectionType = 'identificacion' | 'historia' | 'nutriologica' | 'bitacora' | 'analisis' | 'seguimiento' | 'documentos' | 'seguridad';

interface MenuItem {
  id: SectionType;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: 'identificacion', label: 'Identificación del paciente', Icon: User },
  { id: 'historia', label: 'Historia clínica', Icon: ClipboardList },
  { id: 'nutriologica', label: 'Historia nutriológica', Icon: Salad },
  { id: 'bitacora', label: 'Bitácora', Icon: Clock },
  { id: 'analisis', label: 'Análisis y reportes', Icon: Activity },
  { id: 'seguimiento', label: 'Seguimiento', Icon: CalendarDays },
  { id: 'documentos', label: 'Documentos', Icon: FolderPlus },
  { id: 'seguridad', label: 'Seguridad y registro de actividad', Icon: Lock },
];

interface PatientData {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
  fechaNacimiento?: string;
  sexoBiologico?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  domicilio?: string;
  estadoCivil?: string;
  escolaridad?: string;
  alergias?: string;
  edad?: number;
  peso?: number;
  talla?: number;
  profilePicture?: string;
}

export function Expediente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState<SectionType>('identificacion');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patient data when component mounts
  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await patientAPI.getPatientById(patientId);
      
      if (result.success) {
        setPatient(result.patient);
      } else {
        setError(result.error || 'Error al cargar datos del paciente');
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError(err.message || 'Error al cargar datos del paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('Búsqueda activada');
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-[20px] flex items-center justify-center h-full">
          <p className="font-[Poppins] font-normal text-[18px] text-gray-500">
            Cargando datos del paciente...
          </p>
        </div>
      );
    }

    if (error || !patient) {
      return (
        <div className="p-[20px] flex items-center justify-center h-full">
          <div className="text-center">
            <p className="font-[Poppins] font-normal text-[18px] text-red-600 mb-4">
              {error || 'No se pudo cargar la información del paciente'}
            </p>
            <button
              onClick={() => navigate('/mis-pacientes')}
              className="px-6 py-2 bg-[#39588a] text-white rounded-lg hover:bg-[#2d4570] transition-colors"
            >
              Volver a Mis Pacientes
            </button>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'identificacion':
        return <IdentificacionPaciente patient={patient} />;
      case 'historia':
        return <HistoriaClinica patient={patient} />;
      case 'nutriologica':
        return <HistoriaNutriologica patient={patient} />;
      case 'bitacora':
        return (
          <div className="p-[20px]">
            <p className="font-[Poppins] font-normal text-[18px] text-gray-600 italic">
              Bitácora en desarrollo
            </p>
          </div>
        );
      case 'analisis':
        return <AnalisisYReportes patient={patient} />;
      case 'seguimiento':
        return (
          <div className="p-[20px]">
            <p className="font-[Poppins] font-normal text-[18px] text-gray-600 italic">
              Seguimiento en desarrollo
            </p>
          </div>
        );
      case 'documentos':
        return (
          <div className="p-[20px]">
            <p className="font-[Poppins] font-normal text-[18px] text-gray-600 italic">
              Documentos en desarrollo
            </p>
          </div>
        );
      case 'seguridad':
        return (
          <div className="p-[20px]">
            <p className="font-[Poppins] font-normal text-[18px] text-gray-600 italic">
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
            className="font-[Poppins] font-medium leading-[normal] not-italic text-[18px] text-center text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
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
          <div
            className={`bg-[#e1e9f2] flex-shrink-0 rounded-br-[25px] rounded-tr-[25px] pt-[45px] pb-[40px] flex flex-col transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? 'w-[280px]' : 'w-[72px]'
            }`}
          >
            {/* Header: title + hamburger toggle */}
            <div className={`flex items-center mb-[40px] px-[16px] ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
              {isSidebarExpanded && (
                <span className="font-[Poppins] font-bold text-[22px] text-black truncate">
                  Expediente
                </span>
              )}
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="text-[#1D1B20] hover:text-[#458dff] transition-colors p-1 rounded flex-shrink-0"
                aria-label={isSidebarExpanded ? 'Colapsar menú' : 'Expandir menú'}
              >
                <Menu size={22} strokeWidth={2} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col">
              {menuItems.map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      title={!isSidebarExpanded ? item.label : undefined}
                      className={`w-full flex items-center gap-[14px] py-[18px] transition-colors group ${
                        isSidebarExpanded ? 'px-[20px]' : 'justify-center px-0'
                      } ${
                        isActive
                          ? 'text-[#458dff]'
                          : 'text-[#1E1E1E] hover:text-[#458dff]'
                      }`}
                    >
                      <item.Icon
                        size={22}
                        strokeWidth={2.2}
                        className="flex-shrink-0"
                      />
                      {isSidebarExpanded && (
                        <span className="font-[Poppins] font-medium text-[15px] leading-tight text-left">
                          {item.label}
                        </span>
                      )}
                    </button>
                    {index < menuItems.length - 1 && (
                      <div className="h-px bg-[#3457bf] mx-[10px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
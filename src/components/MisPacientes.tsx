import { useState, useEffect } from 'react';
import { Search, Bell, User, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ProfileMenu } from './ProfileMenu';
import { AddPatientModal } from './AddPatientModal';
import { professionalAPI } from '../utils/api';
import imgLetter from "figma:asset/68645c8d41ac0e552cb9e9f63caabbbc0ee2b1d3.png";

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  edad: number;
  sexoBiologico: string;
  correo: string;
  telefono: string;
  folio: string;
}

export function MisPacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const result = await professionalAPI.getPatients();
      
      if (result.success) {
        setPatients(result.patients);
      } else {
        console.error('Error loading patients:', result.error);
        toast.error('Error al cargar pacientes: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Error al cargar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.nombre} ${patient.apellidos}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

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

  const handleAddPatient = () => {
    setIsAddModalOpen(true);
  };

  const handlePatientClick = (patient: Patient) => {
    console.log('Paciente seleccionado:', patient.nombre);
    navigate(`/expediente/${patient.id}`);
  };

  const handleContactClick = (type: 'email' | 'phone', value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else {
      window.location.href = `tel:${value}`;
    }
  };

  const handleConfiguracion = () => {
    setIsProfileMenuOpen(false);
    console.log('Navegando a Configuración');
    navigate('/configuracion');
  };

  const handleCerrarSesion = () => {
    setIsProfileMenuOpen(false);
    console.log('Cerrando sesión');
    
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">¿Estás seguro de que deseas cerrar sesión?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              // Aquí iría la lógica para cerrar sesión
              localStorage.removeItem('accessToken');
              toast.success('Sesión cerrada exitosamente');
              navigate('/');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
          >
            Sí, cerrar sesión
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#fff',
        color: '#333',
        minWidth: '300px',
      },
    });
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
            
            {/* User Menu Button */}
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
      <div className="pt-[80px] pb-[40px] flex justify-center">
        <div className="bg-white rounded-[40px] w-[90%] max-w-[1225px] min-h-[1040px] p-[45px] relative">
          {/* Title */}
          <h1 className="font-['Poppins:Bold',sans-serif] leading-[normal] not-italic text-[30px] text-black mb-[20px]">
            Mis pacientes
          </h1>

          {/* Description */}
          <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[45px]">
            Accede rapidamente a la información de tus pacientes, dando clic en el recuadro accede a diversas funciones
          </p>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-[29px] mb-[45px]">
            {/* Add Patient Button */}
            <button
              onClick={handleAddPatient}
              className="bg-[#39588a] hover:bg-[#2d4670] h-[37px] rounded-[15px] w-[240px] flex items-center justify-center transition-colors"
            >
              <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-white">
                Agregar paciente
              </p>
            </button>

            {/* Search Bar */}
            <div className="relative">
              <div className="bg-[#e1e9f2] h-[49px] rounded-[50px] w-[502px] flex items-center px-[22px]">
                <input
                  type="text"
                  placeholder="Buscar paciente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent font-['Poppins:Regular',sans-serif] text-[18px] text-black placeholder:text-[rgba(0,0,0,0.6)] outline-none"
                />
                <Search size={20} className="text-[#303030]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-500">
                Cargando pacientes...
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-[rgba(217,215,216,0.8)] h-[63px] rounded-[10px] mb-[15px] flex items-center px-[37px]">
                <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black w-[260px]">
                  Nombre
                </p>
                <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black w-[100px]">
                  Edad
                </p>
                <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black w-[200px]">
                  Sexo biológico
                </p>
                <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[20px] text-black flex-1">
                  Contacto
                </p>
              </div>

              {/* Patient List */}
              {filteredPatients.length === 0 ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-gray-500">
                    {searchTerm ? 'No se encontraron pacientes' : 'No tienes pacientes registrados'}
                  </p>
                </div>
              ) : (
                <div className="space-y-[6px]">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientClick(patient)}
                      className="border-[0.5px] border-black border-solid h-[55px] rounded-[50px] w-full flex items-center px-[37px] hover:bg-[#f5f8fa] transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black w-[260px] text-left">
                        {patient.nombre} {patient.apellidos}
                      </p>

                      {/* Age */}
                      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black w-[100px] text-left">
                        {patient.edad}
                      </p>

                      {/* Sex */}
                      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black w-[200px] text-left">
                        {patient.sexoBiologico}
                      </p>

                      {/* Contact */}
                      <div className="flex items-center gap-[45px] flex-1">
                        {/* Email */}
                        <div className="flex items-center gap-[8px]">
                          <img src={imgLetter} alt="Email" className="size-[37px]" />
                          <button
                            onClick={(e) => handleContactClick('email', patient.correo, e)}
                            className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black underline hover:text-[#3457bf] transition-colors"
                          >
                            Correo
                          </button>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-[8px]">
                          <Phone size={30} className="text-[#1E1E1E]" strokeWidth={2} />
                          <button
                            onClick={(e) => handleContactClick('phone', patient.telefono, e)}
                            className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black underline hover:text-[#3457bf] transition-colors"
                          >
                            Teléfono
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadPatients}
      />
    </div>
  );
}
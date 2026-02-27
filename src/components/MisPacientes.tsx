import { useState } from 'react';
import { Search, Bell, User, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProfileMenu } from './ProfileMenu';
import imgLetter from "figma:asset/68645c8d41ac0e552cb9e9f63caabbbc0ee2b1d3.png";

interface Patient {
  id: number;
  nombre: string;
  edad: number;
  sexoBiologico: string;
  correo: string;
  telefono: string;
}

const mockPatients: Patient[] = [
  { id: 1, nombre: 'Patricio Castillo Antonio', edad: 28, sexoBiologico: 'Hombre', correo: 'patricio@email.com', telefono: '555-0101' },
  { id: 2, nombre: 'Margarita Muñoz López', edad: 18, sexoBiologico: 'Mujer', correo: 'margarita@email.com', telefono: '555-0102' },
  { id: 3, nombre: 'Alejandra Cortes Pérez', edad: 29, sexoBiologico: 'Mujer', correo: 'alejandra@email.com', telefono: '555-0103' },
  { id: 4, nombre: 'Daniel Antonio Salvador', edad: 46, sexoBiologico: 'Hombre', correo: 'daniel@email.com', telefono: '555-0104' },
  { id: 5, nombre: 'Pablo Pablo Pablo', edad: 20, sexoBiologico: 'Hombre', correo: 'pablo@email.com', telefono: '555-0105' },
  { id: 6, nombre: 'Alejandro Uno Dos', edad: 19, sexoBiologico: 'Mujer', correo: 'alejandro@email.com', telefono: '555-0106' },
  { id: 7, nombre: 'Paciente Martita', edad: 17, sexoBiologico: 'Mujer', correo: 'martita@email.com', telefono: '555-0107' },
];

export function MisPacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredPatients = mockPatients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = () => {
    console.log('Búsqueda activada');
  };

  const handleNotifications = () => {
    console.log('Notificaciones activadas');
    alert('Notificaciones en desarrollo');
  };

  const handleAddPatient = () => {
    console.log('Agregar paciente');
    alert('Función de agregar paciente en desarrollo');
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
    alert('Navegando a Configuración de cuenta');
  };

  const handleCerrarSesion = () => {
    setIsProfileMenuOpen(false);
    console.log('Cerrando sesión');
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      alert('Sesión cerrada');
      // Aquí iría la lógica para cerrar sesión
      navigate('/login');
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
          <div className="space-y-[6px]">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className="border-[0.5px] border-black border-solid h-[55px] rounded-[50px] w-full flex items-center px-[37px] hover:bg-[#f5f8fa] transition-colors cursor-pointer"
              >
                {/* Name */}
                <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black w-[260px] text-left">
                  {patient.nombre}
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
        </div>
      </div>
    </div>
  );
}
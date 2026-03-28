import { useState, useEffect } from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ProfileMenu } from './ProfileMenu';
import { getUserData, patientAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";
import imgFoodiesMealIngredients from "figma:asset/ab1a1cb53499fd7537e3427b3dd57bc7c74b57ed.png";
import imgCoolKidsOnWheels from "figma:asset/84a8a89c1913a34f01f581c6a7cd48d9c2cd1445.png";
import imgLifesaversHand from "figma:asset/a359c166e3c6c52ae6fba315f1afeac60968b39e.png";
import imgCoolKidsAloneTime from "figma:asset/a19df1aeeeaa40b6e7abaeada2a62b68f64ac612.png";
import imgHappyBunchChat from "figma:asset/3801a4dad9b0d3378d29571589ff08210e598380.png";

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
  const [glucoseData, setGlucoseData] = useState<any[]>([]);
  const [isLoadingGlucose, setIsLoadingGlucose] = useState(false);
  const [average, setAverage] = useState<number>(0);
  
  const [patientData, setPatientData] = useState({
    nombre: 'Paciente',
    apellidos: '',
    folio: '',
    id: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = getUserData();
    if (userData) {
      setPatientData({
        nombre: userData.nombre || 'Paciente',
        apellidos: userData.apellidos || '',
        folio: userData.folio || '',
        id: userData.id || '',
      });
      
      // Load glucose data for patient
      if (userData.id) {
        loadGlucoseData(userData.id);
      }
    } else {
      // If no user data, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const loadGlucoseData = async (patientId: string) => {
    try {
      setIsLoadingGlucose(true);
      const result = await patientAPI.getGlucoseRecords(patientId);
      
      if (result.success && result.records.length > 0) {
        // Take last 14 records and format them
        const recentRecords = result.records.slice(0, 14).reverse();
        
        const chartData = recentRecords.map((record: any, index: number) => {
          // Parse date in local timezone (no UTC conversion)
          const [year, month, day] = record.date.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const label = `${date.getDate()} ${monthNames[date.getMonth()]}`;
          
          return {
            id: `glucose-${index}-${record.date}-${record.time}`, // Unique key
            fecha: label,
            glucosa: record.glucoseValue,
            objetivo: 140,
          };
        });
        
        setGlucoseData(chartData);
        
        // Calculate average
        const sum = recentRecords.reduce((acc: number, record: any) => acc + record.glucoseValue, 0);
        const avg = Math.round(sum / recentRecords.length);
        setAverage(avg);
      } else {
        setGlucoseData([]);
        setAverage(0);
      }
    } catch (error) {
      console.error('Error loading glucose data:', error);
      setGlucoseData([]);
    } finally {
      setIsLoadingGlucose(false);
    }
  };

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const handleActionClick = (route: string) => {
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

  const fullName = `${patientData.nombre} ${patientData.apellidos}`.trim();

  return (
    <div className="bg-[#85aab3] min-h-screen w-full relative">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          {/* Logo */}
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
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
                {fullName}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px] justify-items-center mb-[30px]">
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

            {/* AI Insulin Calculator - Special Button */}
            <div className="flex justify-center">
              <button
                onClick={() => window.open('https://huggingface.co/spaces/Lu1sHF/NIAXG', '_blank')}
                className="group cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative w-[550px]">
                  {/* Header Bar with gradient */}
                  <div className="relative h-[50px] rounded-t-[10px] bg-gradient-to-r from-[#5e7deb] to-[#8db9f2] group-hover:from-[#4d6bd9] group-hover:to-[#7aa8e1] transition-all shadow-md">
                    <div className="absolute inset-0 flex items-center justify-center gap-[10px]">
                      <Sparkles size={24} className="text-white" />
                      <p className="font-['Poppins:Bold',sans-serif] text-[22px] text-white">
                        Calcular dosis de insulina con IA
                      </p>
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="bg-[#f2f2f2] rounded-b-[10px] p-[20px] group-hover:bg-[#e8e8e8] transition-colors shadow-lg">
                    <div className="flex items-center justify-center h-[140px]">
                      <img 
                        alt="Calcular dosis IA" 
                        className="max-h-full object-contain pointer-events-none" 
                        src={imgHappyBunchChat} 
                      />
                    </div>
                    <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-center text-gray-600 mt-[10px]">
                      Obtén una recomendación personalizada basada en tus datos de glucosa, ejercicio y alimentación
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Evolution Tables Section */}
          <div>
            <p className="font-['Poppins:Bold',sans-serif] leading-[normal] not-italic text-[24px] text-[#5e7deb] mb-[20px]">
              GLUCOSA
            </p>
            
            <div className="flex gap-[30px]">
              {/* Chart Container */}
              <div className="flex-1 bg-[#d9d9d9] rounded-[20px] p-[25px]">
                <div className="bg-white rounded-[10px] p-[20px]">
                  {/* Chart with color bands */}
                  <div className="h-[380px] relative">
                    {isLoadingGlucose ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500 italic text-center">
                          Cargando datos...
                        </p>
                      </div>
                    ) : glucoseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={glucoseData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: 10,
                            bottom: 30,
                          }}
                        >
                          {/* Color bands using ReferenceArea */}
                          <ReferenceArea y1={250} y2={350} fill="#ff8000" fillOpacity={0.3} />
                          <ReferenceArea y1={180} y2={250} fill="#f2e307" fillOpacity={0.3} />
                          <ReferenceArea y1={70} y2={180} fill="#00913f" fillOpacity={0.3} />
                          <ReferenceArea y1={0} y2={70} fill="#d8b2b2" fillOpacity={0.3} />
                          
                          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                          <XAxis 
                            dataKey="fecha" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis 
                            domain={[0, 350]} 
                            ticks={[0, 70, 180, 250, 350]}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #ccc',
                              borderRadius: '5px',
                              fontSize: '13px'
                            }}
                          />
                          
                          {/* Glucose line */}
                          <Line 
                            key="line-glucosa"
                            type="monotone" 
                            dataKey="glucosa" 
                            stroke="#5e7deb" 
                            strokeWidth={2.5}
                            dot={{ fill: '#5e7deb', r: 4 }}
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500 italic text-center">
                          No hay datos de glucosa registrados
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Average display */}
                  {!isLoadingGlucose && glucoseData.length > 0 && (
                    <div className="mt-[15px] text-center">
                      <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#5e7deb]">
                        Promedio: {average} mg/dL
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Glucose Levels Legend */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-[8px] mb-[15px]">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#00913f]">
                    <polygon points="8,0 16,8 8,16" fill="currentColor" />
                  </svg>
                  <p className="font-['Poppins:Bold',sans-serif] text-[16px] text-black">
                    Rango objetivo
                  </p>
                </div>
                <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600 mb-[20px] ml-[24px]">
                  70-180 mg/dL
                </p>
                
                <p className="font-['Poppins:Bold',sans-serif] text-[16px] text-black mb-[12px]">
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
                  <div className="flex flex-col justify-between h-[303px] py-[2px]">
                    {glucoseLevels.map((level, index) => (
                      <div key={index} className="flex-shrink-0" style={{ marginBottom: index < glucoseLevels.length - 1 ? '10px' : '0' }}>
                        <p className="font-['Poppins:Bold',sans-serif] text-[16px] text-black leading-[1.2]">
                          {level.label}
                        </p>
                        <p className="font-['Poppins:Regular',sans-serif] text-[11px] text-black leading-[1.3]">
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
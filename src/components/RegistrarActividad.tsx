import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Activity, Clock, Flame } from 'lucide-react';

interface ActividadFisica {
  id: string;
  nombre: string;
  caloriasQuemadas: number;
  intensidad: 'baja' | 'media' | 'alta';
  icon: string;
}

const actividadesComunes: ActividadFisica[] = [
  { id: '1', nombre: 'Caminar', caloriasQuemadas: 150, intensidad: 'baja', icon: '🚶' },
  { id: '2', nombre: 'Correr', caloriasQuemadas: 400, intensidad: 'alta', icon: '🏃' },
  { id: '3', nombre: 'Ciclismo', caloriasQuemadas: 300, intensidad: 'media', icon: '🚴' },
  { id: '4', nombre: 'Natación', caloriasQuemadas: 350, intensidad: 'alta', icon: '🏊' },
  { id: '5', nombre: 'Yoga', caloriasQuemadas: 120, intensidad: 'baja', icon: '🧘' },
  { id: '6', nombre: 'Pesas', caloriasQuemadas: 250, intensidad: 'media', icon: '🏋️' },
  { id: '7', nombre: 'Baile', caloriasQuemadas: 200, intensidad: 'media', icon: '💃' },
  { id: '8', nombre: 'Futbol', caloriasQuemadas: 380, intensidad: 'alta', icon: '⚽' },
];

export function RegistrarActividad() {
  const navigate = useNavigate();
  const [selectedActividad, setSelectedActividad] = useState<ActividadFisica | null>(null);
  const [duracion, setDuracion] = useState(30);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');

  const getIntensidadColor = (intensidad: string) => {
    switch (intensidad) {
      case 'baja':
        return 'bg-green-100 text-green-700';
      case 'media':
        return 'bg-yellow-100 text-yellow-700';
      case 'alta':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calcularCaloriasTotal = () => {
    if (!selectedActividad) return 0;
    return Math.round((selectedActividad.caloriasQuemadas / 30) * duracion);
  };

  const handleSave = () => {
    if (!selectedActividad) {
      alert('Por favor selecciona una actividad');
      return;
    }
    
    console.log('Guardando actividad:', {
      actividad: selectedActividad,
      duracion,
      fecha,
      notas,
      caloriasQuemadas: calcularCaloriasTotal(),
    });
    
    alert('Actividad física registrada exitosamente');
    navigate('/menu-paciente');
  };

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[80px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[40px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          <button
            onClick={() => navigate('/menu-paciente')}
            className="flex items-center gap-2 text-white hover:text-[#8db9f2] transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-['Poppins:Regular',sans-serif] text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[100px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1200px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <Activity size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Registrar Actividad Física
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
            {/* Activities Selection */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Selecciona una actividad
              </h2>
              
              <div className="grid grid-cols-2 gap-[15px]">
                {actividadesComunes.map((actividad) => (
                  <button
                    key={actividad.id}
                    onClick={() => setSelectedActividad(actividad)}
                    className={`p-[20px] rounded-[15px] transition-all ${
                      selectedActividad?.id === actividad.id
                        ? 'bg-[#39588a] text-white shadow-lg scale-105'
                        : 'bg-[#f5f5f5] text-black hover:bg-[#e5e5e5]'
                    }`}
                  >
                    <div className="text-[40px] mb-[10px]">{actividad.icon}</div>
                    <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] mb-[5px]">
                      {actividad.nombre}
                    </p>
                    <p className={`text-[12px] px-[10px] py-[3px] rounded-full inline-block ${
                      selectedActividad?.id === actividad.id
                        ? 'bg-white bg-opacity-20'
                        : getIntensidadColor(actividad.intensidad)
                    }`}>
                      {actividad.intensidad}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Details */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Detalles de la actividad
              </h2>
              
              <div className="space-y-[20px]">
                {/* Fecha */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    <Clock size={18} className="inline mr-2" />
                    Duración (minutos)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="w-full h-2 bg-[#e1e9f2] rounded-lg appearance-none cursor-pointer accent-[#39588a]"
                  />
                  <div className="flex justify-between mt-[5px]">
                    <span className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
                      5 min
                    </span>
                    <span className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#39588a]">
                      {duracion} min
                    </span>
                    <span className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
                      180 min
                    </span>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="¿Cómo te sentiste? ¿Algo que destacar?"
                    rows={4}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] resize-none"
                  />
                </div>

                {/* Calories Burned Summary */}
                {selectedActividad && (
                  <div className="bg-[#39588a] rounded-[20px] p-[25px] text-white">
                    <div className="flex items-center gap-[10px] mb-[15px]">
                      <Flame size={24} />
                      <h3 className="font-['Poppins:Bold',sans-serif] text-[20px]">
                        Calorías quemadas estimadas
                      </h3>
                    </div>
                    <p className="font-['Poppins:Bold',sans-serif] text-[48px] text-center">
                      {calcularCaloriasTotal()}
                    </p>
                    <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-center opacity-90">
                      kilocalorías
                    </p>
                    <div className="mt-[15px] pt-[15px] border-t border-white border-opacity-20">
                      <p className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                        {selectedActividad.nombre} • {duracion} minutos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-[30px]">
            <button
              onClick={handleSave}
              disabled={!selectedActividad}
              className={`rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all ${
                !selectedActividad
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95'
              }`}
            >
              Guardar registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

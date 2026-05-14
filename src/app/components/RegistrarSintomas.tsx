import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertCircle, Plus, Heart } from 'lucide-react';

interface Sintoma {
  id: string;
  nombre: string;
  icon: React.ReactNode;
  categoria: string;
}

const sintomasComunes: Sintoma[] = [
  { id: '1', nombre: 'Dolor de cabeza', icon: '🤕', categoria: 'dolor' },
  { id: '2', nombre: 'Mareo', icon: '😵', categoria: 'malestar' },
  { id: '3', nombre: 'Náuseas', icon: '🤢', categoria: 'malestar' },
  { id: '4', nombre: 'Fatiga', icon: '😴', categoria: 'energia' },
  { id: '5', nombre: 'Temblores', icon: '🥶', categoria: 'fisico' },
  { id: '6', nombre: 'Sudoración', icon: '💦', categoria: 'fisico' },
  { id: '7', nombre: 'Visión borrosa', icon: '👓', categoria: 'vision' },
  { id: '8', nombre: 'Sed excesiva', icon: '🚰', categoria: 'malestar' },
  { id: '9', nombre: 'Hambre excesiva', icon: '🍽️', categoria: 'malestar' },
  { id: '10', nombre: 'Confusión', icon: '🤔', categoria: 'mental' },
  { id: '11', nombre: 'Irritabilidad', icon: '😠', categoria: 'mental' },
  { id: '12', nombre: 'Palpitaciones', icon: '💓', categoria: 'cardiaco' },
];

export function RegistrarSintomas() {
  const navigate = useNavigate();
  const [selectedSintomas, setSelectedSintomas] = useState<string[]>([]);
  const [intensidad, setIntensidad] = useState(5);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [descripcion, setDescripcion] = useState('');

  const toggleSintoma = (sintomaId: string) => {
    if (selectedSintomas.includes(sintomaId)) {
      setSelectedSintomas(selectedSintomas.filter(id => id !== sintomaId));
    } else {
      setSelectedSintomas([...selectedSintomas, sintomaId]);
    }
  };

  const getIntensidadInfo = (valor: number) => {
    if (valor <= 3) return { texto: 'Leve', color: 'text-green-600', emoji: <Plus className="text-green-600" size={24} /> };
    if (valor <= 6) return { texto: 'Moderado', color: 'text-yellow-600', emoji: <Plus className="text-yellow-600" size={24} /> };
    return { texto: 'Severo', color: 'text-red-600', emoji: <Plus className="text-red-600" size={24} /> };
  };

  const intensidadInfo = getIntensidadInfo(intensidad);

  const handleSave = () => {
    if (selectedSintomas.length === 0) {
      toast.error('Por favor selecciona al menos un síntoma');
      return;
    }

    const sintomasSeleccionados = sintomasComunes.filter(s => selectedSintomas.includes(s.id));

    console.log('Guardando síntomas:', {
      sintomas: sintomasSeleccionados,
      intensidad,
      fecha,
      hora,
      descripcion,
    });

    toast.success('Registro de síntomas guardado exitosamente');
    navigate('/menu-paciente');
  };

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
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
            <Heart size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Registrar Síntomas
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px]">
            {/* Symptoms Selection */}
            <div className="lg:col-span-2">
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Selecciona los síntomas que experimentas
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[15px]">
                {sintomasComunes.map((sintoma) => (
                  <button
                    key={sintoma.id}
                    onClick={() => toggleSintoma(sintoma.id)}
                    className={`p-[15px] rounded-[15px] transition-all ${
                      selectedSintomas.includes(sintoma.id)
                        ? 'bg-[#39588a] text-white shadow-lg scale-105'
                        : 'bg-[#f5f5f5] text-black hover:bg-[#e5e5e5]'
                    }`}
                  >
                    <div className="text-[32px] mb-[8px]">{sintoma.icon}</div>
                    <p className="font-['Poppins:Medium',sans-serif] text-[14px]">
                      {sintoma.nombre}
                    </p>
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="mt-[25px]">
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Descripción detallada (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe cómo te sientes, cuándo comenzaron los síntomas, etc."
                  rows={5}
                  className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] resize-none"
                />
              </div>
            </div>

            {/* Details Panel */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Detalles
              </h2>
              
              <div className="space-y-[20px]">
                {/* Date */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  />
                </div>

                {/* Intensity */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Intensidad
                  </label>
                  <div className="bg-[#f5f5f5] rounded-[15px] p-[20px]">
                    <div className="flex items-center justify-between mb-[15px]">
                      {intensidadInfo.emoji}
                      <span className={`font-['Poppins:Bold',sans-serif] text-[20px] ${intensidadInfo.color}`}>
                        {intensidadInfo.texto}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensidad}
                      onChange={(e) => setIntensidad(Number(e.target.value))}
                      className="w-full h-2 bg-[#e1e9f2] rounded-lg appearance-none cursor-pointer accent-[#39588a]"
                    />
                    <div className="flex justify-between mt-[10px]">
                      <span className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600">
                        1 (Leve)
                      </span>
                      <span className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#39588a]">
                        {intensidad}
                      </span>
                      <span className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600">
                        10 (Severo)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Count */}
                {selectedSintomas.length > 0 && (
                  <div className="bg-[#39588a] rounded-[15px] p-[20px] text-white">
                    <div className="flex items-center gap-[10px] mb-[10px]">
                      <AlertCircle size={20} />
                      <p className="font-['Poppins:Bold',sans-serif] text-[16px]">
                        Síntomas seleccionados
                      </p>
                    </div>
                    <p className="font-['Poppins:Bold',sans-serif] text-[32px] text-center">
                      {selectedSintomas.length}
                    </p>
                    <div className="mt-[10px] space-y-[5px]">
                      {sintomasComunes
                        .filter(s => selectedSintomas.includes(s.id))
                        .map(s => (
                          <p key={s.id} className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                            • {s.nombre}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-[15px] rounded">
                  <div className="flex items-start gap-[10px]">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-yellow-800">
                      Si experimentas síntomas severos, consulta a tu médico inmediatamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-[30px]">
            <button
              onClick={handleSave}
              disabled={selectedSintomas.length === 0}
              className={`rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all ${
                selectedSintomas.length === 0
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
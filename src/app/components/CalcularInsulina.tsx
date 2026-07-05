import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, AlertCircle, Activity, Utensils, Droplet, Heart } from 'lucide-react';

export function CalcularInsulina() {
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [dosisCalculada, setDosisCalculada] = useState(0);

  // Simulated patient data - in real app, this would come from the database
  const [patientData] = useState({
    ultimaGlucosa: 180,
    fechaGlucosa: '2026-03-04 08:30',
    ejercicioHoy: 'Caminata 30 min',
    caloriasDia: 1850,
    ultimaComida: 'Desayuno - Avena con frutas',
    cicloMenstrual: 'Fase lútea - Día 22',
  });

  const handleCalcular = () => {
    setIsCalculating(true);
    
    // Simulate AI calculation
    setTimeout(() => {
      // Simple calculation based on glucose level
      const glucosa = patientData.ultimaGlucosa;
      const ejercicioFactor = patientData.ejercicioHoy ? 0.8 : 1; // Reduce if exercised
      const cicloFactor = patientData.cicloMenstrual.includes('lútea') ? 1.1 : 1; // Increase in luteal phase
      
      const dosisBase = Math.max(0, (glucosa - 100) / 50);
      const dosisAjustada = Math.round(dosisBase * ejercicioFactor * cicloFactor);
      
      setDosisCalculada(dosisAjustada);
      setIsCalculating(false);
      setShowResult(true);
    }, 2000);
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
            <span className="font-[Poppins] font-normal text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[100px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1000px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <div className="bg-gradient-to-r from-[#5e7deb] to-[#8db9f2] rounded-full p-[10px]">
              <Sparkles size={36} className="text-white" />
            </div>
            <h1 className="font-[Poppins] font-bold text-[36px] text-[#193073]">
              Calcular Dosis de Insulina con IA
            </h1>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-[#e8f4ff] to-[#f0f8ff] border-l-4 border-[#5e7deb] rounded-[10px] p-[20px] mb-[30px]">
            <p className="font-[Poppins] font-medium text-[16px] text-[#193073]">
              La IA analizará tus datos recientes de glucosa, actividad física, alimentación y ciclo menstrual para calcular una dosis personalizada.
            </p>
          </div>

          {/* Patient Data Summary */}
          <div className="space-y-[20px] mb-[30px]">
            <h2 className="font-[Poppins] font-semibold text-[24px] text-black mb-[20px]">
              Datos actuales considerados:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              {/* Glucose Card */}
              <div className="bg-[#f5f9ff] rounded-[15px] p-[20px] border-2 border-[#8db9f2]">
                <div className="flex items-start gap-[15px]">
                  <div className="bg-[#5e7deb] rounded-full p-[10px]">
                    <Droplet size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-[Poppins] font-bold text-[16px] text-[#193073] mb-[5px]">
                      Última Glucosa
                    </p>
                    <p className="font-[Poppins] font-bold text-[28px] text-[#5e7deb]">
                      {patientData.ultimaGlucosa} mg/dL
                    </p>
                    <p className="font-[Poppins] font-normal text-[12px] text-gray-600">
                      {patientData.fechaGlucosa}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exercise Card */}
              <div className="bg-[#fff5f0] rounded-[15px] p-[20px] border-2 border-[#ff9966]">
                <div className="flex items-start gap-[15px]">
                  <div className="bg-[#ff8844] rounded-full p-[10px]">
                    <Activity size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-[Poppins] font-bold text-[16px] text-[#cc6633] mb-[5px]">
                      Ejercicio de Hoy
                    </p>
                    <p className="font-[Poppins] font-medium text-[16px] text-black">
                      {patientData.ejercicioHoy || 'Sin registro'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Food Card */}
              <div className="bg-[#f0fff5] rounded-[15px] p-[20px] border-2 border-[#66cc99]">
                <div className="flex items-start gap-[15px]">
                  <div className="bg-[#44aa77] rounded-full p-[10px]">
                    <Utensils size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-[Poppins] font-bold text-[16px] text-[#2d7755] mb-[5px]">
                      Alimentación
                    </p>
                    <p className="font-[Poppins] font-medium text-[14px] text-black mb-[5px]">
                      {patientData.ultimaComida}
                    </p>
                    <p className="font-[Poppins] font-normal text-[12px] text-gray-600">
                      Calorías del día: {patientData.caloriasDia} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Menstrual Cycle Card */}
              <div className="bg-[#fff0f8] rounded-[15px] p-[20px] border-2 border-[#ff99cc]">
                <div className="flex items-start gap-[15px]">
                  <div className="bg-[#ee77aa] rounded-full p-[10px]">
                    <Heart size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-[Poppins] font-bold text-[16px] text-[#cc4477] mb-[5px]">
                      Ciclo Menstrual
                    </p>
                    <p className="font-[Poppins] font-medium text-[14px] text-black">
                      {patientData.cicloMenstrual}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          {!showResult && (
            <div className="flex justify-center mb-[30px]">
              <button
                onClick={handleCalcular}
                disabled={isCalculating}
                className={`rounded-[20px] px-[50px] py-[18px] font-[Poppins] font-bold text-[20px] transition-all flex items-center gap-[15px] shadow-lg ${
                  isCalculating
                    ? 'bg-gray-400 text-gray-200 cursor-wait'
                    : 'bg-gradient-to-r from-[#5e7deb] to-[#8db9f2] hover:from-[#4d6bd9] hover:to-[#7aa8e1] text-white active:scale-95'
                }`}
              >
                <Sparkles size={28} className={isCalculating ? 'animate-spin' : ''} />
                {isCalculating ? 'Calculando con IA...' : 'Calcular Dosis Recomendada'}
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {isCalculating && (
            <div className="bg-gradient-to-br from-[#f0f8ff] to-[#e8f4ff] rounded-[20px] p-[30px] text-center">
              <div className="flex justify-center mb-[20px]">
                <div className="animate-pulse">
                  <Sparkles size={48} className="text-[#5e7deb]" />
                </div>
              </div>
              <p className="font-[Poppins] font-medium text-[18px] text-[#193073]">
                Analizando tus datos con inteligencia artificial...
              </p>
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <div className="space-y-[25px]">
              <div className="bg-gradient-to-br from-[#e8f4ff] to-[#d4e7ff] border-4 border-[#5e7deb] rounded-[25px] p-[35px]">
                <div className="flex items-start gap-[20px]">
                  <div className="bg-[#5e7deb] rounded-full p-[15px]">
                    <Sparkles size={36} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-[Poppins] font-bold text-[28px] text-[#193073] mb-[15px]">
                      Recomendación de IA
                    </h3>
                    
                    <div className="bg-white rounded-[15px] p-[25px] mb-[20px] shadow-lg">
                      <p className="font-[Poppins] font-medium text-[18px] text-gray-700 mb-[15px]">
                        Dosis de insulina recomendada:
                      </p>
                      <p className="font-[Poppins] font-bold text-[48px] text-[#5e7deb] text-center">
                        {dosisCalculada} unidades
                      </p>
                    </div>

                    <div className="bg-[#fff9e6] rounded-[15px] p-[20px] border-2 border-[#ffcc00]">
                      <p className="font-[Poppins] font-bold text-[16px] text-[#cc9900] mb-[10px]">
                        Factores considerados:
                      </p>
                      <ul className="font-[Poppins] font-normal text-[14px] text-gray-700 space-y-[5px]">
                        <li>✓ Nivel de glucosa actual: {patientData.ultimaGlucosa} mg/dL</li>
                        <li>✓ Actividad física: {patientData.ejercicioHoy} (reduce necesidad de insulina)</li>
                        <li>✓ Fase del ciclo menstrual: {patientData.cicloMenstrual} (puede aumentar resistencia)</li>
                        <li>✓ Ingesta calórica del día: {patientData.caloriasDia} kcal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="bg-red-50 border-2 border-red-300 rounded-[15px] p-[20px] flex items-start gap-[15px]">
                <AlertCircle size={28} className="text-red-600 flex-shrink-0 mt-[2px]" />
                <div>
                  <p className="font-[Poppins] font-bold text-[18px] text-red-800 mb-[8px]">
                    ⚠️ Importante - Consulta Médica Obligatoria
                  </p>
                  <p className="font-[Poppins] font-normal text-[14px] text-red-700">
                    Esta es solo una <strong>estimación orientativa</strong> generada por IA basada en tus datos actuales. 
                    <strong> NO reemplaza el criterio médico profesional.</strong> Siempre consulta con tu médico o endocrinólogo 
                    antes de realizar cualquier cambio en tu dosis de insulina. La administración incorrecta de insulina puede 
                    tener consecuencias graves para tu salud.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-[20px]">
                <button
                  onClick={() => {
                    setShowResult(false);
                    setIsCalculating(false);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-black rounded-[15px] px-[30px] py-[12px] font-[Poppins] font-bold text-[16px] transition-all active:scale-95"
                >
                  Calcular de nuevo
                </button>
                <button
                  onClick={() => navigate('/menu-paciente')}
                  className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[15px] px-[30px] py-[12px] font-[Poppins] font-bold text-[16px] transition-all active:scale-95"
                >
                  Volver al menú
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

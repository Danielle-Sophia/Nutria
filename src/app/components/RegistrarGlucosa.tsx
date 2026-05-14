import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Droplet, AlertCircle } from 'lucide-react';
import { patientAPI } from '../utils/api';
import { CustomAlert } from './CustomAlert';

export function RegistrarGlucosa() {
  const navigate = useNavigate();
  const [glucosa, setGlucosa] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [momento, setMomento] = useState('ayunas');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [alertState, setAlertState] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  }>({ show: false, message: '', type: 'info' });

  const getNivelGlucosa = (valor: number) => {
    if (valor < 54) return { nivel: 'Muy baja', color: 'bg-[#590202] text-white', mensaje: '¡Atención! Nivel peligrosamente bajo' };
    if (valor < 70) return { nivel: 'Baja', color: 'bg-[#8c0303] text-white', mensaje: 'Nivel bajo, considera tomar algo dulce' };
    if (valor <= 180) return { nivel: 'Rango objetivo', color: 'bg-[#00913f] text-white', mensaje: 'Nivel óptimo' };
    if (valor <= 250) return { nivel: 'Alta', color: 'bg-[#f2e307] text-black', mensaje: 'Nivel elevado, monitorea tu alimentación' };
    return { nivel: 'Muy alta', color: 'bg-[#ff8000] text-white', mensaje: '¡Atención! Nivel muy elevado' };
  };

  const valorGlucosa = parseFloat(glucosa);
  const nivelInfo = valorGlucosa > 0 ? getNivelGlucosa(valorGlucosa) : null;

  const handleSave = async () => {
    if (!glucosa || valorGlucosa <= 0) {
      setAlertState({
        show: true,
        message: 'Por favor ingresa un valor de glucosa válido',
        type: 'warning',
        title: 'Campo requerido'
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await patientAPI.saveGlucoseRecord({
        glucoseValue: valorGlucosa,
        date: fecha,
        time: hora,
        notes: `${momento}: ${notas}`.trim(),
      });

      if (result.success) {
        setAlertState({
          show: true,
          message: 'Tu registro de glucosa ha sido guardado exitosamente',
          type: 'success',
          title: 'Registro guardado'
        });
        // Navigate after closing alert
        setTimeout(() => {
          navigate('/menu-paciente');
        }, 500);
      } else {
        setAlertState({
          show: true,
          message: result.error || 'Ocurrió un error al intentar guardar el registro',
          type: 'error',
          title: 'Error al guardar'
        });
      }
    } catch (error: any) {
      console.error('Error saving glucose:', error);
      setAlertState({
        show: true,
        message: error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo',
        type: 'error',
        title: 'Error al guardar'
      });
    } finally {
      setIsSaving(false);
    }
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
        <div className="bg-white rounded-[40px] p-[40px] max-w-[800px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <Droplet size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Registrar Glucosa
            </h1>
          </div>

          <div className="space-y-[25px]">
            {/* Glucose Value Input */}
            <div>
              <label className="font-['Poppins:Medium',sans-serif] text-[18px] text-black block mb-[10px]">
                Nivel de glucosa (mg/dL)
              </label>
              <input
                type="number"
                value={glucosa}
                onChange={(e) => setGlucosa(e.target.value)}
                placeholder="Ej: 120"
                min="0"
                max="600"
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[15px] font-['Poppins:Bold',sans-serif] text-[32px] text-center outline-none focus:ring-2 focus:ring-[#458dff]"
              />
            </div>

            {/* Glucose Level Indicator */}
            {nivelInfo && (
              <div className={`${nivelInfo.color} rounded-[15px] p-[20px]`}>
                <div className="flex items-start gap-[10px]">
                  <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-['Poppins:Bold',sans-serif] text-[20px] mb-[5px]">
                      {nivelInfo.nivel}
                    </p>
                    <p className="font-['Poppins:Regular',sans-serif] text-[16px] opacity-90">
                      {nivelInfo.mensaje}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-[20px]">
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
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Hora
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                />
              </div>
            </div>

            {/* Momento del día */}
            <div>
              <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[10px]">
                Momento de medición
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
                {[
                  { value: 'ayunas', label: 'En ayunas' },
                  { value: 'antes-comida', label: 'Antes de comida' },
                  { value: 'despues-comida', label: 'Después de comida' },
                  { value: 'antes-dormir', label: 'Antes de dormir' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMomento(option.value)}
                    className={`px-[15px] py-[10px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] transition-all ${
                      momento === option.value
                        ? 'bg-[#39588a] text-white'
                        : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="¿Cómo te sientes? ¿Comiste algo antes?"
                rows={4}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] resize-none"
              />
            </div>

            {/* Reference Chart */}
            <div className="bg-[#f5f5f5] rounded-[15px] p-[20px]">
              <h3 className="font-['Poppins:Bold',sans-serif] text-[16px] text-black mb-[15px]">
                Niveles de referencia
              </h3>
              <div className="space-y-[8px] text-[14px]">
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#590202] rounded"></div>
                  <span className="font-['Poppins:Regular',sans-serif]">Muy baja: {'<'} 54 mg/dL</span>
                </div>
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#8c0303] rounded"></div>
                  <span className="font-['Poppins:Regular',sans-serif]">Baja: 54 - 69 mg/dL</span>
                </div>
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#00913f] rounded"></div>
                  <span className="font-['Poppins:Regular',sans-serif]">Rango objetivo: 70 - 180 mg/dL</span>
                </div>
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#f2e307] rounded"></div>
                  <span className="font-['Poppins:Regular',sans-serif]">Alta: 181 - 250 mg/dL</span>
                </div>
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#ff8000] rounded"></div>
                  <span className="font-['Poppins:Regular',sans-serif]">Muy alta: {'>'} 250 mg/dL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-[30px]">
            <button
              onClick={handleSave}
              disabled={!glucosa || valorGlucosa <= 0 || isSaving}
              className={`rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all ${
                !glucosa || valorGlucosa <= 0 || isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95'
              }`}
            >
              {isSaving ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alertState.show && (
        <CustomAlert
          show={alertState.show}
          message={alertState.message}
          type={alertState.type}
          title={alertState.title}
          onClose={() => setAlertState({ show: false, message: '', type: 'info' })}
        />
      )}
    </div>
  );
}
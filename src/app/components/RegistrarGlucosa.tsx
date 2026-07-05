import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Droplet, AlertCircle, History, X, ChevronRight } from 'lucide-react';
import { patientAPI, getUserData } from '../utils/api';
import { CustomAlert } from './CustomAlert';

interface GlucoseRecord {
  id: string;
  glucoseValue: number;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
}

export function RegistrarGlucosa() {
  const navigate = useNavigate();
  const [glucosa, setGlucosa] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toTimeString().slice(0, 5));
  const [momento, setMomento] = useState('ayunas');
  const [notas, setNotas] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [alertState, setAlertState] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  }>({ show: false, message: '', type: 'info' });

  const getNivelGlucosa = (valor: number) => {
    if (valor < 54) return { nivel: 'Muy baja', color: 'bg-[#590202] text-white', dot: 'bg-[#590202]' };
    if (valor < 70) return { nivel: 'Baja', color: 'bg-[#8c0303] text-white', dot: 'bg-[#8c0303]' };
    if (valor <= 180) return { nivel: 'Rango objetivo', color: 'bg-[#00913f] text-white', dot: 'bg-[#00913f]' };
    if (valor <= 250) return { nivel: 'Alta', color: 'bg-[#f2e307] text-black', dot: 'bg-[#f2e307]' };
    return { nivel: 'Muy alta', color: 'bg-[#ff8000] text-white', dot: 'bg-[#ff8000]' };
  };

  const getNivelInfo = (valor: number) => {
    if (valor < 54) return { ...getNivelGlucosa(valor), mensaje: '¡Atención! Nivel peligrosamente bajo' };
    if (valor < 70) return { ...getNivelGlucosa(valor), mensaje: 'Nivel bajo, considera tomar algo dulce' };
    if (valor <= 180) return { ...getNivelGlucosa(valor), mensaje: 'Nivel óptimo' };
    if (valor <= 250) return { ...getNivelGlucosa(valor), mensaje: 'Nivel elevado, monitorea tu alimentación' };
    return { ...getNivelGlucosa(valor), mensaje: '¡Atención! Nivel muy elevado' };
  };

  const valorGlucosa = parseFloat(glucosa);
  const nivelInfo = valorGlucosa > 0 ? getNivelInfo(valorGlucosa) : null;

  const fetchRecords = useCallback(async () => {
    const user = getUserData();
    if (!user?.id) return;
    setLoadingRecords(true);
    try {
      const result = await patientAPI.getGlucoseRecords(user.id);
      if (result.success) {
        setRecords(result.records || []);
      }
    } catch (err) {
      console.error('Error fetching glucose records:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async () => {
    if (!glucosa || valorGlucosa <= 0) {
      setAlertState({ show: true, message: 'Por favor ingresa un valor de glucosa válido', type: 'warning', title: 'Campo requerido' });
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
        setAlertState({ show: true, message: 'Tu registro de glucosa ha sido guardado exitosamente', type: 'success', title: 'Registro guardado' });
        setGlucosa('');
        setNotas('');
        fetchRecords();
        setTimeout(() => navigate('/menu-paciente'), 500);
      } else {
        setAlertState({ show: true, message: result.error || 'Ocurrió un error al intentar guardar el registro', type: 'error', title: 'Error al guardar' });
      }
    } catch (error: any) {
      setAlertState({ show: true, message: error.message || 'Ocurrió un error inesperado. Por favor intenta de nuevo', type: 'error', title: 'Error al guardar' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatFecha = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getMomentoFromNotes = (notes: string) => {
    const map: Record<string, string> = {
      'ayunas': 'Ayunas',
      'antes-comida': 'Antes comida',
      'despues-comida': 'Después comida',
      'antes-dormir': 'Antes dormir',
    };
    for (const key of Object.keys(map)) {
      if (notes.startsWith(key)) return map[key];
    }
    return '';
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

      {/* Main layout */}
      <div className="pt-[80px] pb-[40px] px-[20px] lg:px-[40px] flex gap-[24px] items-start max-w-[1400px] mx-auto">

        {/* Form card */}
        <div className="bg-white rounded-[40px] p-[40px] flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center justify-between mb-[30px]">
            <div className="flex items-center gap-[15px]">
              <Droplet size={36} className="text-[#39588a]" />
              <h1 className="font-[Poppins] font-bold text-[36px] text-[#193073]">
                Registrar Glucosa
              </h1>
            </div>
            {/* Historial button — visible on mobile / small screens, hidden on large */}
            <button
              onClick={() => setHistorialOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#39588a] text-white px-[16px] py-[10px] rounded-[12px] font-[Poppins] font-medium text-[14px] hover:bg-[#2d4570] transition-colors"
            >
              <History size={18} />
              Historial
              {records.length > 0 && (
                <span className="bg-white text-[#39588a] rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold">
                  {records.length}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-[25px]">
            {/* Glucose Value Input */}
            <div>
              <label className="font-[Poppins] font-medium text-[18px] text-black block mb-[10px]">
                Nivel de glucosa (mg/dL)
              </label>
              <input
                type="number"
                value={glucosa}
                onChange={(e) => setGlucosa(e.target.value)}
                placeholder="Ej: 120"
                min="0"
                max="600"
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[15px] font-[Poppins] font-bold text-[32px] text-center outline-none focus:ring-2 focus:ring-[#458dff]"
              />
            </div>

            {/* Glucose Level Indicator */}
            {nivelInfo && (
              <div className={`${nivelInfo.color} rounded-[15px] p-[20px]`}>
                <div className="flex items-start gap-[10px]">
                  <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-[Poppins] font-bold text-[20px] mb-[5px]">{nivelInfo.nivel}</p>
                    <p className="font-[Poppins] font-normal text-[16px] opacity-90">{nivelInfo.mensaje}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-[20px]">
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                />
              </div>
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Hora</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                />
              </div>
            </div>

            {/* Momento */}
            <div>
              <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[10px]">
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
                    className={`px-[15px] py-[10px] rounded-[10px] font-[Poppins] font-medium text-[14px] transition-all ${
                      momento === option.value ? 'bg-[#39588a] text-white' : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                Notas adicionales (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="¿Cómo te sientes? ¿Comiste algo antes?"
                rows={4}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] resize-none"
              />
            </div>

            {/* Reference Chart */}
            <div className="bg-[#f5f5f5] rounded-[15px] p-[20px]">
              <h3 className="font-[Poppins] font-bold text-[16px] text-black mb-[15px]">Niveles de referencia</h3>
              <div className="space-y-[8px] text-[14px]">
                {[
                  { color: 'bg-[#590202]', label: 'Muy baja: < 54 mg/dL' },
                  { color: 'bg-[#8c0303]', label: 'Baja: 54 - 69 mg/dL' },
                  { color: 'bg-[#00913f]', label: 'Rango objetivo: 70 - 180 mg/dL' },
                  { color: 'bg-[#f2e307]', label: 'Alta: 181 - 250 mg/dL' },
                  { color: 'bg-[#ff8000]', label: 'Muy alta: > 250 mg/dL' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-[10px]">
                    <div className={`w-[20px] h-[20px] ${item.color} rounded`}></div>
                    <span className="font-[Poppins] font-normal">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-[30px]">
            <button
              onClick={handleSave}
              disabled={!glucosa || valorGlucosa <= 0 || isSaving}
              className={`rounded-[15px] px-[40px] py-[15px] font-[Poppins] font-bold text-[18px] transition-all ${
                !glucosa || valorGlucosa <= 0 || isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95'
              }`}
            >
              {isSaving ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </div>

        {/* Historial panel — sidebar on large screens */}
        <div className="hidden lg:flex flex-col bg-white rounded-[30px] w-[340px] flex-shrink-0 overflow-hidden" style={{ maxHeight: 'calc(100vh - 100px)', position: 'sticky', top: '80px' }}>
          <div className="bg-[#193073] px-[24px] py-[18px] flex items-center gap-[10px]">
            <History size={22} className="text-[#8db9f2]" />
            <h2 className="font-[Poppins] font-bold text-[18px] text-white flex-1">Historial de glucosa</h2>
            {records.length > 0 && (
              <span className="bg-[#8db9f2] text-[#193073] rounded-full px-[10px] py-[2px] text-[13px] font-bold">
                {records.length}
              </span>
            )}
          </div>
          <HistorialContent records={records} loading={loadingRecords} formatFecha={formatFecha} getMomento={getMomentoFromNotes} getNivel={getNivelGlucosa} />
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {historialOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setHistorialOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[320px] bg-white shadow-2xl flex flex-col">
            <div className="bg-[#193073] px-[20px] py-[16px] flex items-center gap-[10px]">
              <History size={20} className="text-[#8db9f2]" />
              <h2 className="font-[Poppins] font-bold text-[17px] text-white flex-1">Historial de glucosa</h2>
              <button onClick={() => setHistorialOpen(false)} className="text-white/70 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <HistorialContent records={records} loading={loadingRecords} formatFecha={formatFecha} getMomento={getMomentoFromNotes} getNivel={getNivelGlucosa} />
          </div>
        </div>
      )}

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

interface HistorialContentProps {
  records: GlucoseRecord[];
  loading: boolean;
  formatFecha: (d: string) => string;
  getMomento: (n: string) => string;
  getNivel: (v: number) => { nivel: string; dot: string };
}

function HistorialContent({ records, loading, formatFecha, getMomento, getNivel }: HistorialContentProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-[24px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#39588a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-[Poppins] font-normal text-[14px] text-gray-500">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-[24px]">
        <div className="text-center">
          <Droplet size={40} className="text-[#c5d5e4] mx-auto mb-3" />
          <p className="font-[Poppins] font-medium text-[15px] text-gray-400">Sin registros aún</p>
          <p className="font-[Poppins] font-normal text-[13px] text-gray-400 mt-1">Tu historial aparecerá aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-[16px] space-y-[10px]">
      {records.map((rec) => {
        const nivel = getNivel(rec.glucoseValue);
        const momento = getMomento(rec.notes || '');
        const notaExtra = rec.notes ? rec.notes.replace(/^[^:]+:\s*/, '') : '';
        return (
          <div key={rec.id} className="bg-[#f5f8fc] rounded-[14px] p-[14px] border border-[#e1e9f2]">
            <div className="flex items-center justify-between mb-[6px]">
              <div className="flex items-center gap-[8px]">
                <div className={`w-[10px] h-[10px] rounded-full ${nivel.dot}`} />
                <span className="font-[Poppins] font-bold text-[22px] text-[#193073] leading-none">
                  {rec.glucoseValue}
                  <span className="font-[Poppins] font-normal text-[12px] text-gray-400 ml-1">mg/dL</span>
                </span>
              </div>
              <span className="font-[Poppins] font-normal text-[12px] text-gray-500">
                {formatFecha(rec.date)} · {rec.time}
              </span>
            </div>
            <div className="flex items-center gap-[6px] flex-wrap">
              <span className={`text-[11px] font-[Poppins] font-medium px-[8px] py-[2px] rounded-full ${nivel.dot} bg-opacity-20 text-gray-700`}>
                {nivel.nivel}
              </span>
              {momento && (
                <span className="text-[11px] font-[Poppins] font-normal text-gray-500 bg-gray-100 px-[8px] py-[2px] rounded-full">
                  {momento}
                </span>
              )}
            </div>
            {notaExtra && (
              <p className="font-[Poppins] font-normal text-[12px] text-gray-500 mt-[6px] line-clamp-2">{notaExtra}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

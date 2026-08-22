import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp, Utensils } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Tooltip,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { professionalAPI, patientAPI } from '../utils/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
}

interface GlucosePoint {
  id: string;
  name: string;
  displayName: string;
  value: number;
  time?: string;
}

interface FoodRecord {
  id: string;
  foodName: string;
  mealType: string;
  date: string;
  time: string;
  quantity: number;
  unit: string;
  nutritionalInfo?: { carbohidratos?: number; calorias?: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toTitleCase(str?: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
}

function formatHour(h: number): string {
  const hh = Math.floor(h);
  return `${String(hh).padStart(2, '0')}:00`;
}

function TargetArrow({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d={direction === 'up' ? 'M9 3 L15 12 L3 12 Z' : 'M9 15 L15 6 L3 6 Z'} fill="#00913F" />
    </svg>
  );
}

// Custom food dot for scatter chart
function FoodDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill="#FFF3CD" stroke="#F59E0B" strokeWidth={2} />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={16}>🍽️</text>
    </g>
  );
}

// Custom tooltip for food scatter
function FoodTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-[#e1e9f2] rounded-[10px] p-[12px] shadow-lg text-[13px]">
      <p className="font-[Poppins] font-bold text-[#193073] mb-1">{d.foodName}</p>
      <p className="text-gray-600">🕐 {d.timeLabel}</p>
      <p className="text-gray-600">🥖 <span className="font-semibold text-[#39588a]">{d.carbs?.toFixed(1)}g</span> carbohidratos</p>
      {d.cals != null && <p className="text-gray-400">{d.cals?.toFixed(0)} kcal</p>}
      <p className="text-gray-500 mt-1">{d.mealType}</p>
    </div>
  );
}

const glucoseLevels = [
  { label: 'Muy alta', range: '>250 mg/dL', color: '#ff8000' },
  { label: 'Alta', range: '181 - 249 mg/dL', color: '#f2e307' },
  { label: 'Rango objetivo', range: '70 - 180 mg/dL', color: '#00913f' },
  { label: 'Baja', range: '54 - 69 mg/dL', color: '#8c0303' },
  { label: 'Muy baja', range: '< 54 mg/dL', color: '#590202' },
];

// ── Main component ─────────────────────────────────────────────────────────────

export function TablasEvolucion() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [glucoseData, setGlucoseData] = useState<GlucosePoint[]>([]);
  const [average, setAverage] = useState(0);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingGlucose, setIsLoadingGlucose] = useState(false);
  const [glucoseError, setGlucoseError] = useState<string | null>(null);

  // Food state
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [isLoadingFood, setIsLoadingFood] = useState(false);
  const [selectedFoodDate, setSelectedFoodDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => { loadPatients(); }, []);
  useEffect(() => {
    if (selectedPatientId) {
      loadGlucoseData(selectedPatientId);
      loadFoodData(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true);
      const result = await professionalAPI.getPatients();
      if (result.success && result.patients.length > 0) {
        setPatients(result.patients);
        setSelectedPatientId(result.patients[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingPatients(false); }
  };

  const loadGlucoseData = async (patientId: string) => {
    try {
      setIsLoadingGlucose(true);
      setGlucoseError(null);
      const result = await patientAPI.getGlucoseRecords(patientId);
      if (result.success && result.records.length > 0) {
        const recent = result.records.slice(0, 14).reverse();
        const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const data: GlucosePoint[] = recent.map((r: any, i: number) => {
          const [y, mo, d] = r.date.split('-').map(Number);
          const dt = new Date(y, mo - 1, d);
          const label = `${dt.getDate()} ${monthNames[dt.getMonth()]}`;
          return {
            id: `g-${patientId}-${i}-${r.date}-${r.time}`,
            name: `${label}-${i}`,
            displayName: label,
            value: r.glucoseValue,
            time: r.time,
          };
        });
        setGlucoseData(data);
        const sum = recent.reduce((a: number, r: any) => a + r.glucoseValue, 0);
        setAverage(Math.round(sum / recent.length));
      } else {
        setGlucoseData([]); setAverage(0);
      }
    } catch (e: any) {
      setGlucoseError(e.message || 'Error al cargar glucosa');
    } finally { setIsLoadingGlucose(false); }
  };

  const loadFoodData = async (patientId: string) => {
    try {
      setIsLoadingFood(true);
      const result = await patientAPI.getFoodRecords(patientId);
      if (result.success && result.records.length > 0) {
        setFoodRecords(result.records);
        const dates = [...new Set<string>(result.records.map((r: FoodRecord) => r.date))].sort().reverse();
        setAvailableDates(dates);
        setSelectedFoodDate(dates[0] || '');
      } else {
        setFoodRecords([]); setAvailableDates([]); setSelectedFoodDate('');
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingFood(false); }
  };

  // Records for selected food date
  const dayRecords = foodRecords.filter(r => r.date === selectedFoodDate);
  const totalCarbsDay = dayRecords.reduce((s, r) => s + (r.nutritionalInfo?.carbohidratos ?? 0), 0);
  const scatterData = dayRecords.map(r => ({
    x: timeToHours(r.time),
    y: r.nutritionalInfo?.carbohidratos ?? 0,
    foodName: r.foodName,
    timeLabel: r.time,
    carbs: r.nutritionalInfo?.carbohidratos,
    cals: r.nutritionalInfo?.calorias,
    mealType: r.mealType,
  }));

  // Group by meal for the summary header
  const byMeal: Record<string, { total: number; count: number }> = {};
  dayRecords.forEach(r => {
    const key = r.mealType || 'Otro';
    if (!byMeal[key]) byMeal[key] = { total: 0, count: 0 };
    byMeal[key].total += r.nutritionalInfo?.carbohidratos ?? 0;
    byMeal[key].count += 1;
  });

  const formatDateLabel = (d: string) => {
    if (!d) return '';
    const [y, mo, day] = d.split('-');
    return `${day}/${mo}/${y}`;
  };

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          <button onClick={() => navigate('/menu-profesional')}
            className="font-['Istok_Web:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer">
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          <button onClick={() => navigate('/menu-profesional')} className="flex items-center gap-2 text-white hover:text-[#8db9f2] transition-colors">
            <ArrowLeft size={24} />
            <span className="font-[Poppins] font-normal text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] px-[40px]">
        <div className="bg-white rounded-[40px] p-[40px]">
          <h1 className="font-[Poppins] font-bold text-[36px] text-[#193073] mb-[30px]">Tablas de Evolución</h1>

          {/* Filters */}
          <div className="flex gap-[20px] mb-[30px] flex-wrap">
            <div className="flex items-center gap-[10px]">
              <Calendar size={20} className="text-[#39588a]" />
              <select className="bg-[#e1e9f2] rounded-[10px] px-[20px] py-[10px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]">
                <option>Últimos 14 días</option>
                <option>Último mes</option>
                <option>Últimos 3 meses</option>
                <option>Último año</option>
              </select>
            </div>
            <select
              className="bg-[#e1e9f2] rounded-[10px] px-[20px] py-[10px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Selecciona un paciente</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{toTitleCase(p.nombre)} {toTitleCase(p.apellidos)}</option>
              ))}
            </select>
          </div>

          {/* ── GLUCOSE SECTION ───────────────────────────────────────────── */}

          {/* Legend */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[8px] mb-[5px]">
              <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16" fill="#00913f" /></svg>
              <p className="font-[Poppins] font-bold text-[16px] text-black">Rango objetivo</p>
            </div>
            <p className="font-[Poppins] font-normal text-[12px] text-gray-600 mb-[20px] ml-[24px]">70-180 mg/dL</p>
            <p className="font-[Poppins] font-semibold text-[16px] text-black mb-[15px]">Niveles de glucosa</p>
            <div className="flex items-start gap-[20px]">
              <div className="w-[98px] h-[232px] rounded-[10px] overflow-hidden flex flex-col">
                <div className="bg-[#ff8000] h-[30px]" />
                <div className="bg-[#f2e307] h-[70px]" />
                <div className="bg-[#00913f] h-[110px]" />
                <div className="bg-[#8c0303] h-[16px]" />
                <div className="bg-[#590202] h-[16px]" />
              </div>
              <div className="flex flex-col justify-between h-[232px] py-[2px]">
                {glucoseLevels.map((level, i) => (
                  <div key={i} className="flex-shrink-0">
                    <p className="font-[Poppins] font-bold text-[16px] text-black leading-[1.2]">{level.label}</p>
                    <p className="font-[Poppins] font-normal text-[11px] text-black leading-[1.3]">{level.range}</p>
                  </div>
                ))}
              </div>
              <div className="ml-[30px] flex items-center gap-[10px] mt-[10px]">
                <div className="w-[30px] h-[3px] bg-[#86A69D]" />
                <p className="font-[Poppins] font-normal text-[14px] text-black">Glucosa</p>
              </div>
            </div>
          </div>

          {/* Glucose chart */}
          <div className="mb-[50px]">
            <p className="font-[Poppins] font-bold text-[20px] text-[#5e7deb] mb-[15px]">GLUCOSA</p>
            <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
              <div className="bg-white rounded-[10px] p-[30px] relative">
                {isLoadingGlucose ? (
                  <div className="h-[500px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#5e7deb] border-t-transparent rounded-full animate-spin mr-3" />
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-500">Cargando datos de glucosa...</p>
                  </div>
                ) : glucoseError ? (
                  <div className="h-[500px] flex items-center justify-center">
                    <p className="font-[Poppins] font-normal text-[16px] text-red-600">{glucoseError}</p>
                  </div>
                ) : !selectedPatientId ? (
                  <div className="h-[500px] flex items-center justify-center">
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-400">Selecciona un paciente para ver sus datos</p>
                  </div>
                ) : glucoseData.length === 0 ? (
                  <div className="h-[500px] flex items-center justify-center flex-col gap-4">
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-500">No hay registros de glucosa disponibles</p>
                    <p className="font-[Poppins] font-normal text-[14px] text-gray-400 text-center max-w-[400px]">
                      El paciente aún no ha registrado mediciones de glucosa.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="absolute left-[15px] top-[235px] flex flex-col items-center gap-[3px]">
                      <p className="font-[Poppins] font-bold text-[12px] text-[#00913f] whitespace-nowrap transform -rotate-90 origin-center">
                        Rango objetivo
                      </p>
                    </div>

                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={glucoseData.map(d => ({ ...d, key: d.id }))} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <ReferenceArea key="ta-area-1" y1={250} y2={350} fill="#ff8000" fillOpacity={0.3} />
                        <ReferenceArea key="ta-area-2" y1={180} y2={250} fill="#f2e307" fillOpacity={0.3} />
                        <ReferenceArea key="ta-area-3" y1={70}  y2={180} fill="#00913f" fillOpacity={0.3} />
                        <ReferenceArea key="ta-area-4" y1={54}  y2={70}  fill="#8c0303" fillOpacity={0.3} />
                        <ReferenceArea key="ta-area-5" y1={0}   y2={54}  fill="#590202" fillOpacity={0.3} />
                        <ReferenceLine key="ta-ref-1" y={250} stroke="#000" strokeWidth={1} />
                        <ReferenceLine key="ta-ref-2" y={180} stroke="#00913F" strokeWidth={2} />
                        <ReferenceLine key="ta-ref-3" y={70}  stroke="#00913F" strokeWidth={2} />
                        <ReferenceLine key="ta-ref-4" y={54}  stroke="#000"    strokeWidth={1} />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70}
                          tick={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: 'bold' }}
                          interval={0} axisLine={{ stroke: '#000' }}
                          tickFormatter={(v, i) => glucoseData[i]?.displayName || v.split('-')[0]} />
                        <YAxis domain={[0, 350]} ticks={[0, 54, 70, 180, 250, 350]}
                          tick={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: 500 }}
                          axisLine={{ stroke: '#000' }}
                          label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontFamily: 'Poppins' } }} />
                        <Tooltip
                          formatter={(v: any) => [`${v} mg/dL`, 'Glucosa']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e1e9f2' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#5e7deb" strokeWidth={2.5} dot={{ fill: '#5e7deb', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="absolute left-[75px] top-[110px] flex items-center gap-[5px]">
                      <TargetArrow direction="down" />
                      <p className="font-[Poppins] font-bold text-[10px] text-[#00913f]">180</p>
                    </div>
                    <div className="absolute left-[75px] top-[350px] flex items-center gap-[5px]">
                      <TargetArrow direction="up" />
                      <p className="font-[Poppins] font-bold text-[10px] text-[#00913f]">70</p>
                    </div>

                    {average > 0 && (
                      <div className="mt-[15px] text-center">
                        <p className="font-[Poppins] font-medium text-[16px] text-[#5e7deb]">Promedio: {average} mg/dL</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── FOOD SECTION ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-[12px] mb-[20px]">
              <Utensils size={26} className="text-[#39588a]" />
              <p className="font-[Poppins] font-bold text-[20px] text-[#39588a]">ALIMENTOS</p>
            </div>

            {/* Date selector + summary */}
            {availableDates.length > 0 && (
              <div className="flex items-center gap-[20px] mb-[20px] flex-wrap">
                <div className="flex items-center gap-[10px]">
                  <Calendar size={18} className="text-[#39588a]" />
                  <select
                    value={selectedFoodDate}
                    onChange={(e) => setSelectedFoodDate(e.target.value)}
                    className="bg-[#e1e9f2] rounded-[10px] px-[16px] py-[8px] font-[Poppins] font-normal text-[15px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  >
                    {availableDates.map(d => (
                      <option key={d} value={d}>{formatDateLabel(d)}</option>
                    ))}
                  </select>
                </div>
                {dayRecords.length > 0 && (
                  <div className="flex items-center gap-[20px] flex-wrap">
                    <div className="bg-[#FFF3CD] border border-[#F59E0B] rounded-[10px] px-[16px] py-[8px] flex items-center gap-[8px]">
                      <span className="text-[18px]">🍽️</span>
                      <div>
                        <p className="font-[Poppins] font-bold text-[18px] text-[#193073] leading-none">{totalCarbsDay.toFixed(1)}g</p>
                        <p className="font-[Poppins] font-normal text-[11px] text-gray-500">carbs totales del día</p>
                      </div>
                    </div>
                    {Object.entries(byMeal).map(([meal, info]) => (
                      <div key={meal} className="bg-[#f0f4ff] rounded-[10px] px-[14px] py-[8px]">
                        <p className="font-[Poppins] font-bold text-[15px] text-[#39588a]">{info.total.toFixed(1)}g <span className="font-normal text-gray-400 text-[13px]">({info.count})</span></p>
                        <p className="font-[Poppins] font-normal text-[11px] text-gray-500">{meal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
              <div className="bg-white rounded-[10px] p-[30px]">
                {isLoadingFood ? (
                  <div className="h-[300px] flex items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#39588a] border-t-transparent rounded-full animate-spin" />
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-500">Cargando registros de alimentos...</p>
                  </div>
                ) : !selectedPatientId ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-400">Selecciona un paciente para ver sus alimentos</p>
                  </div>
                ) : foodRecords.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center flex-col gap-3">
                    <Utensils size={40} className="text-gray-300" />
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-400">El paciente no tiene registros de alimentos</p>
                  </div>
                ) : dayRecords.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="font-[Poppins] font-normal text-[16px] text-gray-400">Sin registros para esta fecha</p>
                  </div>
                ) : (
                  <>
                    {/* Scatter chart: X = hour of day, Y = carbs */}
                    <div className="mb-[6px]">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <span className="text-[18px]">🍽️</span>
                        <span className="font-[Poppins] font-medium text-[13px] text-gray-600">Carb. / gramos</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={true} horizontal={true} />
                        <XAxis
                          type="number" dataKey="x"
                          domain={[0, 24]} ticks={[0,2,4,6,8,10,12,14,16,18,20,22,24]}
                          tickFormatter={formatHour}
                          tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                          axisLine={{ stroke: '#999' }}
                          label={{ value: 'Hora del día', position: 'insideBottomRight', offset: -10, style: { fontSize: 11, fill: '#999' } }}
                        />
                        <YAxis
                          type="number" dataKey="y"
                          domain={[0, 'auto']}
                          tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                          axisLine={{ stroke: '#999' }}
                          label={{ value: 'g carbs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#999' } }}
                        />
                        <ZAxis range={[600, 600]} />
                        <Tooltip content={<FoodTooltip />} />
                        <Scatter data={scatterData} shape={<FoodDot />} />
                      </ScatterChart>
                    </ResponsiveContainer>

                    {/* Food records table */}
                    <div className="mt-[24px]">
                      <p className="font-[Poppins] font-semibold text-[15px] text-[#193073] mb-[12px]">Detalle de registros — {formatDateLabel(selectedFoodDate)}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr className="bg-[#f0f4ff]">
                              <th className="text-left px-[14px] py-[10px] font-[Poppins] font-semibold text-[#39588a] rounded-l-[8px]">Hora</th>
                              <th className="text-left px-[14px] py-[10px] font-[Poppins] font-semibold text-[#39588a]">Alimento</th>
                              <th className="text-left px-[14px] py-[10px] font-[Poppins] font-semibold text-[#39588a]">Comida</th>
                              <th className="text-center px-[14px] py-[10px] font-[Poppins] font-semibold text-[#39588a]">Carbs</th>
                              <th className="text-center px-[14px] py-[10px] font-[Poppins] font-semibold text-[#39588a] rounded-r-[8px]">Kcal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dayRecords.map((r, i) => {
                              const carbs = r.nutritionalInfo?.carbohidratos;
                              const cals = r.nutritionalInfo?.calorias;
                              return (
                                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafbff]'}>
                                  <td className="px-[14px] py-[10px] font-[Poppins] font-medium text-gray-600">{r.time}</td>
                                  <td className="px-[14px] py-[10px]">
                                    <div className="flex items-center gap-[8px]">
                                      <span className="text-[15px]">🍽️</span>
                                      <span className="font-[Poppins] font-medium text-[#193073]">{r.foodName}</span>
                                    </div>
                                  </td>
                                  <td className="px-[14px] py-[10px]">
                                    <span className="bg-[#e1e9f2] text-[#39588a] px-[8px] py-[2px] rounded-full font-[Poppins] font-normal text-[11px]">
                                      {r.mealType}
                                    </span>
                                  </td>
                                  <td className="px-[14px] py-[10px] text-center">
                                    {carbs != null
                                      ? <span className="font-[Poppins] font-bold text-[#39588a]">{carbs.toFixed(1)}g</span>
                                      : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-[14px] py-[10px] text-center font-[Poppins] font-normal text-gray-500">
                                    {cals != null ? `${cals.toFixed(0)}` : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-[#e1e9f2] bg-[#f0f4ff]">
                              <td colSpan={3} className="px-[14px] py-[10px] font-[Poppins] font-semibold text-[#193073]">Total del día</td>
                              <td className="px-[14px] py-[10px] text-center font-[Poppins] font-bold text-[#39588a] text-[15px]">{totalCarbsDay.toFixed(1)}g</td>
                              <td className="px-[14px] py-[10px] text-center font-[Poppins] font-normal text-gray-600">
                                {dayRecords.reduce((s, r) => s + (r.nutritionalInfo?.calorias ?? 0), 0).toFixed(0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

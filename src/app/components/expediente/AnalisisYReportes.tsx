import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { UserCircle, Utensils, Calendar } from 'lucide-react';
import { patientAPI } from '../../utils/api';

interface PatientData {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
  profilePicture?: string;
}

interface AnalisisYReportesProps {
  patient: PatientData;
}

interface GlucoseLevel {
  label: string;
  range: string;
  color: string;
}

interface ChartData {
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

const glucoseLevels: GlucoseLevel[] = [
  { label: 'Muy alta', range: '>250 mg/dL', color: '#ff8000' },
  { label: 'Alta', range: '181 - 249 mg/dL', color: '#f2e307' },
  { label: 'Rango objetivo', range: '70 - 180 mg/dL', color: '#00913f' },
  { label: 'Baja', range: '54 - 69 mg/dL', color: '#8c0303' },
  { label: 'Muy baja', range: '< 54 mg/dL', color: '#590202' },
];

const legendItems = [
  { label: 'Glucosa', color: '#86A69D' },
];

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
}

function formatHour(h: number): string {
  return `${String(Math.floor(h)).padStart(2, '0')}:00`;
}

function FoodDot(props: any) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={18} fill="#FFF3CD" stroke="#F59E0B" strokeWidth={2} />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={16}>🍽️</text>
    </g>
  );
}

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

// Custom arrow component for target range markers
function TargetArrow({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path 
        d={direction === 'up' ? 'M9 3 L15 12 L3 12 Z' : 'M9 15 L15 6 L3 6 Z'} 
        fill="#00913F" 
      />
    </svg>
  );
}

export function AnalisisYReportes({ patient }: AnalisisYReportesProps) {
  const [glucoseData, setGlucoseData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [average, setAverage] = useState<number>(0);

  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [isLoadingFood, setIsLoadingFood] = useState(false);
  const [selectedFoodDate, setSelectedFoodDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    loadGlucoseData();
    loadFoodData();
  }, [patient.id]);

  const loadGlucoseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await patientAPI.getGlucoseRecords(patient.id);
      
      if (result.success && result.records.length > 0) {
        // Transform records to chart data
        // Take last 14 records and format them
        const recentRecords = result.records.slice(0, 14).reverse();
        
        const chartData = recentRecords.map((record: any, index: number) => {
          // Parse date in local timezone (no UTC conversion)
          const [year, month, day] = record.date.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const label = `${date.getDate()} ${monthNames[date.getMonth()]}`;

          return {
            id: `glucose-analisis-${patient.id}-${record.id || index}-${record.date}-${record.time}`, // Unique key
            name: `${label}-${index}`, // Make name unique by adding index
            displayName: label, // For display purposes
            value: record.glucoseValue,
            time: record.time,
          };
        });
        
        setGlucoseData(chartData);
        
        // Calculate average
        const sum = recentRecords.reduce((acc: number, record: any) => acc + record.glucoseValue, 0);
        const avg = Math.round(sum / recentRecords.length);
        setAverage(avg);
      } else {
        // No data - show empty state
        setGlucoseData([]);
        setAverage(0);
      }
    } catch (err: any) {
      console.error('Error loading glucose data:', err);
      setError(err.message || 'Error al cargar datos de glucosa');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFoodData = async () => {
    try {
      setIsLoadingFood(true);
      const result = await patientAPI.getFoodRecords(patient.id);
      if (result.success && result.records.length > 0) {
        setFoodRecords(result.records);
        const dates = [...new Set<string>(result.records.map((r: FoodRecord) => r.date))].sort().reverse();
        setAvailableDates(dates);
        setSelectedFoodDate(dates[0] || '');
      } else {
        setFoodRecords([]); setAvailableDates([]); setSelectedFoodDate('');
      }
    } catch (e) { console.error('Error loading food data:', e); }
    finally { setIsLoadingFood(false); }
  };

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
    <div className="p-[20px]">
      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[40px]">
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
          {patient.profilePicture ? (
            <img
              src={patient.profilePicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle size={80} className="text-white" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1">
          <p className="font-[Poppins] font-semibold text-[18px] text-black mb-[8px]">
            {patient.nombre} {patient.apellidos}
          </p>
          <p className="font-[Poppins] font-normal text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Evolution Tables Title */}
      <p className="font-[Poppins] font-medium text-[18px] text-black mb-[20px]">
        Tablas de evolución (últimos 14 días)
      </p>

      {/* Glucose Levels Legend */}
      <div className="mb-[30px]">
        <div className="flex items-center gap-[8px] mb-[15px]">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#00913f]">
            <polygon points="8,0 16,8 8,16" fill="currentColor" />
          </svg>
          <p className="font-[Poppins] font-bold text-[16px] text-black">
            Rango objetivo
          </p>
        </div>
        <p className="font-[Poppins] font-normal text-[12px] text-gray-600 mb-[20px] ml-[24px]">
          70-180 mg/dL
        </p>
        
        <p className="font-[Poppins] font-semibold text-[16px] text-black mb-[15px]">
          Niveles de glucosa
        </p>
        <div className="flex items-start gap-[20px]">
          {/* Color bars */}
          <div className="w-[98px] h-[232px] rounded-[10px] overflow-hidden flex flex-col">
            <div className="bg-[#ff8000] h-[30px]" />
            <div className="bg-[#f2e307] h-[70px]" />
            <div className="bg-[#00913f] h-[110px]" />
            <div className="bg-[#8c0303] h-[16px]" />
            <div className="bg-[#590202] h-[16px]" />
          </div>
          
          {/* Labels */}
          <div className="flex flex-col justify-between h-[232px] py-[2px]">
            {glucoseLevels.map((level, index) => (
              <div key={index} className="flex-shrink-0" style={{ marginBottom: index < glucoseLevels.length - 1 ? '8px' : '0' }}>
                <p className="font-[Poppins] font-bold text-[16px] text-black leading-[1.2]">
                  {level.label}
                </p>
                <p className="font-[Poppins] font-normal text-[11px] text-black leading-[1.3]">
                  {level.range}
                </p>
              </div>
            ))}
          </div>

          {/* Legend items */}
          <div className="ml-[30px] space-y-[10px]">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-[10px]">
                <div 
                  className="w-[30px] h-[3px]" 
                  style={{ backgroundColor: item.color }}
                />
                <p className="font-[Poppins] font-normal text-[14px] text-black">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glucose Chart (Dynamic) */}
      <div className="mb-[40px] flex justify-center">
        <div className="w-full max-w-[1400px]">
          <p className="font-[Poppins] font-bold text-[20px] text-[#5e7deb] mb-[15px]">
            GLUCOSA
          </p>
          <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
            <div className="bg-white rounded-[10px] p-[30px] relative">
              {isLoading ? (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="font-[Poppins] font-normal text-[16px] text-gray-500">
                    Cargando datos de glucosa...
                  </p>
                </div>
              ) : error ? (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="font-[Poppins] font-normal text-[16px] text-red-600">
                    {error}
                  </p>
                </div>
              ) : glucoseData.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center flex-col gap-4">
                  <p className="font-[Poppins] font-normal text-[16px] text-gray-500">
                    No hay registros de glucosa disponibles
                  </p>
                  <p className="font-[Poppins] font-normal text-[14px] text-gray-400 text-center max-w-[400px]">
                    El paciente aún no ha registrado mediciones de glucosa. Los datos aparecerán aquí una vez que comience a registrarlos.
                  </p>
                </div>
              ) : (
                <>
                  {/* Label "Rango objetivo" positioned at the left of the chart at green zone level */}
                  <div className="absolute left-[15px] top-[235px] flex flex-col items-center gap-[3px]">
                    <p className="font-[Poppins] font-bold text-[12px] text-[#00913f] whitespace-nowrap writing-mode-vertical transform -rotate-90 origin-center">
                      Rango objetivo
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart
                      data={glucoseData.map(d => ({ ...d, key: d.id }))}
                      margin={{ top: 20, right: 30, left: 80, bottom: 60 }}
                      id="glucose-chart-analisis"
                    >
                      <CartesianGrid key="grid-analisis" strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />

                      {/* Colored zones (background areas) */}
                      <ReferenceArea key="area-very-high" y1={250} y2={350} fill="#ff8000" fillOpacity={0.3} />
                      <ReferenceArea key="area-high" y1={180} y2={250} fill="#f2e307" fillOpacity={0.3} />
                      <ReferenceArea key="area-target" y1={70} y2={180} fill="#00913f" fillOpacity={0.3} />
                      <ReferenceArea key="area-low" y1={54} y2={70} fill="#8c0303" fillOpacity={0.3} />
                      <ReferenceArea key="area-very-low" y1={0} y2={54} fill="#590202" fillOpacity={0.3} />

                      {/* Reference lines for ranges */}
                      <ReferenceLine key="line-250" y={250} stroke="#000" strokeWidth={1} />
                      <ReferenceLine key="line-180" y={180} stroke="#00913F" strokeWidth={2} />
                      <ReferenceLine key="line-70" y={70} stroke="#00913F" strokeWidth={2} />
                      <ReferenceLine key="line-54" y={54} stroke="#000" strokeWidth={1} />
                      
                      <XAxis
                        key="xaxis-analisis"
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: 'bold' }}
                        interval={0}
                        axisLine={{ stroke: '#000' }}
                        tickFormatter={(value, index) => {
                          const item = glucoseData[index];
                          return item?.displayName || value.split('-')[0];
                        }}
                      />
                      <YAxis
                        key="yaxis-analisis"
                        domain={[0, 350]}
                        ticks={[0, 54, 70, 180, 250, 350]}
                        tick={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: 500 }}
                        axisLine={{ stroke: '#000' }}
                        label={{
                          value: 'mg/dL',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fontSize: 10, fontFamily: 'Poppins' }
                        }}
                      />
                      
                      {/* Glucose line */}
                      <Line
                        key="line-glucose-value"
                        type="monotone"
                        dataKey="value"
                        stroke="#5e7deb"
                        strokeWidth={2.5}
                        dot={{ fill: '#5e7deb', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Green arrows indicating start and end of target range - positioned inside chart area */}
                  {/* Top arrow at 180 mg/dL (end of target range) */}
                  <div className="absolute left-[75px] top-[110px] flex items-center gap-[5px]">
                    <TargetArrow direction="down" />
                    <p className="font-[Poppins] font-bold text-[10px] text-[#00913f]">
                      180
                    </p>
                  </div>
                  
                  {/* Bottom arrow at 70 mg/dL (start of target range) */}
                  <div className="absolute left-[75px] top-[350px] flex items-center gap-[5px]">
                    <TargetArrow direction="up" />
                    <p className="font-[Poppins] font-bold text-[10px] text-[#00913f]">
                      70
                    </p>
                  </div>

                  {/* Average display */}
                  {average > 0 && (
                    <div className="mt-[15px] text-center">
                      <p className="font-[Poppins] font-medium text-[16px] text-[#5e7deb]">
                        Promedio: {average} mg/dL
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOD SECTION ───────────────────────────────────────────────── */}
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
              <div className="flex items-center gap-[16px] flex-wrap">
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
            ) : foodRecords.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center flex-col gap-3">
                <Utensils size={40} className="text-gray-300" />
                <p className="font-[Poppins] font-normal text-[16px] text-gray-400">No hay registros de alimentos aún</p>
                <p className="font-[Poppins] font-normal text-[13px] text-gray-400 text-center max-w-[360px]">
                  Los datos aparecerán aquí una vez que comiences a registrar tus alimentos.
                </p>
              </div>
            ) : dayRecords.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="font-[Poppins] font-normal text-[16px] text-gray-400">Sin registros para esta fecha</p>
              </div>
            ) : (
              <>
                {/* Scatter chart */}
                <div className="mb-[6px] flex items-center gap-[8px]">
                  <span className="text-[18px]">🍽️</span>
                  <span className="font-[Poppins] font-medium text-[13px] text-gray-600">Carb. / gramos</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis type="number" dataKey="x" domain={[0, 24]}
                      ticks={[0,2,4,6,8,10,12,14,16,18,20,22,24]}
                      tickFormatter={formatHour}
                      tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                      axisLine={{ stroke: '#999' }}
                      label={{ value: 'Hora del día', position: 'insideBottomRight', offset: -10, style: { fontSize: 11, fill: '#999' } }}
                    />
                    <YAxis type="number" dataKey="y" domain={[0, 'auto']}
                      tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                      axisLine={{ stroke: '#999' }}
                      label={{ value: 'g carbs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#999' } }}
                    />
                    <ZAxis range={[600, 600]} />
                    <Tooltip content={<FoodTooltip />} />
                    <Scatter data={scatterData} shape={<FoodDot />} />
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Detail table */}
                <div className="mt-[24px]">
                  <p className="font-[Poppins] font-semibold text-[15px] text-[#193073] mb-[12px]">
                    Detalle de registros — {formatDateLabel(selectedFoodDate)}
                  </p>
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
                          const cals  = r.nutritionalInfo?.calorias;
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
                                {cals != null ? cals.toFixed(0) : '—'}
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
  );
}
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";
import { patientAPI } from '../../utils/api';

interface PatientData {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
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
  name: string;
  value: number;
  time?: string;
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

  useEffect(() => {
    loadGlucoseData();
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
            id: `glucose-${patient.id}-${index}-${record.date}-${record.time}`, // Unique key
            name: label, // Show all labels
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

  return (
    <div className="p-[20px]">
      {/* Patient Header */}
      <div className="flex items-center gap-[30px] mb-[40px]">
        <div className="h-[121px] w-[130px] flex-shrink-0">
          <img 
            alt="Avatar paciente" 
            className="w-full h-full object-contain" 
            src={imgAvatarsDefaultWithBackdrop} 
          />
        </div>
        <div className="flex-1">
          <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[8px]">
            {patient.nombre} {patient.apellidos}
          </p>
          <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-black">
            Folio (identificador): {patient.folio}
          </p>
        </div>
      </div>

      {/* Evolution Tables Title */}
      <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black mb-[20px]">
        Tablas de evolución (últimos 14 días)
      </p>

      {/* Glucose Levels Legend */}
      <div className="mb-[30px]">
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
        
        <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[15px]">
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
                <p className="font-['Poppins:Bold',sans-serif] text-[16px] text-black leading-[1.2]">
                  {level.label}
                </p>
                <p className="font-['Poppins:Regular',sans-serif] text-[11px] text-black leading-[1.3]">
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
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-black">
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
          <p className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#5e7deb] mb-[15px]">
            GLUCOSA
          </p>
          <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
            <div className="bg-white rounded-[10px] p-[30px] relative">
              {isLoading ? (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500">
                    Cargando datos de glucosa...
                  </p>
                </div>
              ) : error ? (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-red-600">
                    {error}
                  </p>
                </div>
              ) : glucoseData.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center flex-col gap-4">
                  <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500">
                    No hay registros de glucosa disponibles
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-400 text-center max-w-[400px]">
                    El paciente aún no ha registrado mediciones de glucosa. Los datos aparecerán aquí una vez que comience a registrarlos.
                  </p>
                </div>
              ) : (
                <>
                  {/* Label "Rango objetivo" positioned at the left of the chart at green zone level */}
                  <div className="absolute left-[15px] top-[235px] flex flex-col items-center gap-[3px]">
                    <p className="font-['Poppins:Bold',sans-serif] text-[12px] text-[#00913f] whitespace-nowrap writing-mode-vertical transform -rotate-90 origin-center">
                      Rango objetivo
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={glucoseData} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      
                      {/* Colored zones (background areas) */}
                      <ReferenceArea y1={250} y2={350} fill="#ff8000" fillOpacity={0.3} />
                      <ReferenceArea y1={180} y2={250} fill="#f2e307" fillOpacity={0.3} />
                      <ReferenceArea y1={70} y2={180} fill="#00913f" fillOpacity={0.3} />
                      <ReferenceArea y1={54} y2={70} fill="#8c0303" fillOpacity={0.3} />
                      <ReferenceArea y1={0} y2={54} fill="#590202" fillOpacity={0.3} />
                      
                      {/* Reference lines for ranges */}
                      <ReferenceLine y={250} stroke="#000" strokeWidth={1} />
                      <ReferenceLine y={180} stroke="#00913F" strokeWidth={2} />
                      <ReferenceLine y={70} stroke="#00913F" strokeWidth={2} />
                      <ReferenceLine y={54} stroke="#000" strokeWidth={1} />
                      
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: 'bold' }}
                        interval={0}
                        axisLine={{ stroke: '#000' }}
                      />
                      <YAxis 
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
                    <p className="font-['Poppins:Bold',sans-serif] text-[10px] text-[#00913f]">
                      180
                    </p>
                  </div>
                  
                  {/* Bottom arrow at 70 mg/dL (start of target range) */}
                  <div className="absolute left-[75px] top-[350px] flex items-center gap-[5px]">
                    <TargetArrow direction="up" />
                    <p className="font-['Poppins:Bold',sans-serif] text-[10px] text-[#00913f]">
                      70
                    </p>
                  </div>

                  {/* Average display */}
                  {average > 0 && (
                    <div className="mt-[15px] text-center">
                      <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#5e7deb]">
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

      {/* Placeholder for other charts */}
      <div className="p-[20px] bg-[#f5f5f5] rounded-[10px]">
        <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 italic text-center">
          Gráficas adicionales (Estrés, Estado de ánimo) se mostrarán aquí cuando estén disponibles los datos del backend
        </p>
      </div>
    </div>
  );
}
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart, ReferenceArea } from 'recharts';
import imgAvatarsDefaultWithBackdrop from "figma:asset/096952a3ce49665f2e8700549ef936cfae6aca06.png";

interface PatientData {
  id: number;
  nombre: string;
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
  { label: 'Actividad física (AF)', color: '#FF9933' },
  { label: 'Estrés', color: '#CC99CC' },
  { label: 'Estado de ánimo', color: '#FF6666' },
];

// Fixed glucose data (doesn't change)
const fixedGlucoseData: ChartData[] = [
  { name: 'Noche', value: 120 },
  { name: '', value: 115 },
  { name: '', value: 110 },
  { name: '', value: 105 },
  { name: 'Mañana', value: 130 },
  { name: '', value: 145 },
  { name: '', value: 160 },
  { name: '', value: 175 },
  { name: 'Tarde', value: 165 },
  { name: '', value: 150 },
  { name: '', value: 135 },
  { name: '', value: 125 },
  { name: 'Noche', value: 115 },
];

// Mock data for other charts (these will come from backend)
const actividadFisicaData: ChartData[] = [
  { name: 'Noche', value: 5 },
  { name: '', value: 8 },
  { name: '', value: 12 },
  { name: '', value: 18 },
  { name: 'Mañana', value: 35 },
  { name: '', value: 28 },
  { name: '', value: 22 },
  { name: '', value: 15 },
  { name: 'Tarde', value: 30 },
  { name: '', value: 25 },
  { name: '', value: 18 },
  { name: '', value: 12 },
  { name: 'Noche', value: 8 },
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
            {patient.nombre}
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
        <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[15px]">
          Niveles de glucosa
        </p>
        <div className="flex items-start gap-[30px]">
          {/* Color bars */}
          <div className="w-[98px] h-[232px] rounded-[10px] overflow-hidden flex flex-col">
            <div className="bg-[#ff8000] h-[30px]" />
            <div className="bg-[#f2e307] h-[70px]" />
            <div className="bg-[#00913f] h-[110px]" />
            <div className="bg-[#8c0303] h-[16px]" />
            <div className="bg-[#590202] h-[16px]" />
          </div>
          
          {/* Labels */}
          <div className="flex flex-col justify-between h-[232px] py-[5px]">
            {glucoseLevels.map((level, index) => (
              <div key={index}>
                <p className="font-['Poppins:Bold',sans-serif] text-[18px] text-black leading-tight">
                  {level.label}
                </p>
                <p className="font-['Poppins:Regular',sans-serif] text-[10px] text-black">
                  {level.range}
                </p>
              </div>
            ))}
          </div>

          {/* Legend items */}
          <div className="ml-[40px] space-y-[10px]">
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

      {/* Glucose Chart (Fixed) */}
      <div className="mb-[40px]">
        <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#7f94e2] mb-[15px] uppercase">
          Glucosa
        </p>
        <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
          <div className="bg-white rounded-[10px] p-[20px] relative">
            <ResponsiveContainer width="100%" height={365}>
              <LineChart data={fixedGlucoseData} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
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
                  stroke="#86A69D" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Target range arrows and label (positioned absolutely) */}
            <div className="absolute left-[35px] top-[155px] flex items-center gap-[5px]">
              <TargetArrow direction="up" />
              <p className="font-['Poppins:Bold',sans-serif] text-[10px] text-black whitespace-nowrap">
                Rango objetivo
              </p>
            </div>
            
            <div className="absolute left-[35px] top-[240px] flex items-center gap-[5px]">
              <TargetArrow direction="up" />
            </div>
          </div>
        </div>
      </div>

      {/* Physical Activity Chart (Dynamic) */}
      <div className="mb-[40px]">
        <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#7f94e2] mb-[15px] uppercase">
          Actividad física (AF)
        </p>
        <div className="bg-[#d9d9d9] rounded-[20px] p-[20px]">
          <div className="bg-white rounded-[10px] p-[20px]">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={actividadFisicaData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9933" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF9933" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 50]}
                  tick={{ fontSize: 10, fontFamily: 'Poppins' }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FF9933" 
                  strokeWidth={2}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
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
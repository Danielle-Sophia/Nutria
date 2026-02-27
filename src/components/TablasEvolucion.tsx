import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const glucoseData = [
  { fecha: '13 Feb', glucosa: 120, objetivo: 140 },
  { fecha: '14 Feb', glucosa: 145, objetivo: 140 },
  { fecha: '15 Feb', glucosa: 132, objetivo: 140 },
  { fecha: '16 Feb', glucosa: 128, objetivo: 140 },
  { fecha: '17 Feb', glucosa: 138, objetivo: 140 },
  { fecha: '18 Feb', glucosa: 125, objetivo: 140 },
  { fecha: '19 Feb', glucosa: 130, objetivo: 140 },
  { fecha: '20 Feb', glucosa: 142, objetivo: 140 },
  { fecha: '21 Feb', glucosa: 135, objetivo: 140 },
  { fecha: '22 Feb', glucosa: 127, objetivo: 140 },
  { fecha: '23 Feb', glucosa: 133, objetivo: 140 },
  { fecha: '24 Feb', glucosa: 129, objetivo: 140 },
  { fecha: '25 Feb', glucosa: 136, objetivo: 140 },
  { fecha: '26 Feb', glucosa: 131, objetivo: 140 },
];

const weightData = [
  { fecha: '13 Feb', peso: 78.5 },
  { fecha: '16 Feb', peso: 78.2 },
  { fecha: '19 Feb', peso: 77.9 },
  { fecha: '22 Feb', peso: 77.6 },
  { fecha: '25 Feb', peso: 77.3 },
];

export function TablasEvolucion() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[80px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate('/menu-profesional')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[40px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          <button
            onClick={() => navigate('/menu-profesional')}
            className="flex items-center gap-2 text-white hover:text-[#8db9f2] transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-['Poppins:Regular',sans-serif] text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[100px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px]">
          {/* Title */}
          <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073] mb-[30px]">
            Tablas de Evolución
          </h1>

          {/* Filter Options */}
          <div className="flex gap-[20px] mb-[30px]">
            <div className="flex items-center gap-[10px]">
              <Calendar size={20} className="text-[#39588a]" />
              <select className="bg-[#e1e9f2] rounded-[10px] px-[20px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]">
                <option>Últimos 14 días</option>
                <option>Último mes</option>
                <option>Últimos 3 meses</option>
                <option>Último año</option>
              </select>
            </div>
            
            <select className="bg-[#e1e9f2] rounded-[10px] px-[20px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]">
              <option>Todos los pacientes</option>
              <option>Patricio Castillo Antonio</option>
              <option>María González López</option>
              <option>Juan Pérez Martínez</option>
            </select>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
            {/* Glucose Chart */}
            <div className="bg-[#f5f5f5] rounded-[20px] p-[20px]">
              <div className="flex items-center gap-[10px] mb-[20px]">
                <TrendingUp size={24} className="text-[#39588a]" />
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black">
                  Niveles de Glucosa
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={glucoseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    domain={[100, 160]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="glucosa" 
                    stroke="#39588a" 
                    strokeWidth={2}
                    name="Glucosa (mg/dL)"
                    dot={{ fill: '#39588a', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objetivo" 
                    stroke="#00913f" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Objetivo"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-[15px] text-center">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
                  Promedio: <span className="font-semibold text-[#39588a]">132 mg/dL</span>
                </p>
              </div>
            </div>

            {/* Weight Chart */}
            <div className="bg-[#f5f5f5] rounded-[20px] p-[20px]">
              <div className="flex items-center gap-[10px] mb-[20px]">
                <TrendingUp size={24} className="text-[#39588a]" />
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black">
                  Evolución de Peso
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    domain={[76, 80]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#7f94e2" 
                    fill="#7f94e2"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Peso (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-[15px] text-center">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
                  Cambio: <span className="font-semibold text-green-600">-1.2 kg</span> en 14 días
                </p>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-[#f5f5f5] rounded-[20px] p-[20px]">
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Resumen de Actividad Física
              </h2>
              <div className="space-y-[15px]">
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Promedio de pasos diarios
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    8,450
                  </p>
                </div>
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Minutos de ejercicio/semana
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    180 min
                  </p>
                </div>
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Calorías quemadas/día
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    420 kcal
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Summary */}
            <div className="bg-[#f5f5f5] rounded-[20px] p-[20px]">
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px]">
                Resumen Nutricional
              </h2>
              <div className="space-y-[15px]">
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Calorías promedio/día
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    1,850 kcal
                  </p>
                </div>
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Carbohidratos
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    210 g/día
                  </p>
                </div>
                <div className="bg-white rounded-[10px] p-[15px]">
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[5px]">
                    Proteínas
                  </p>
                  <p className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#39588a]">
                    95 g/día
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

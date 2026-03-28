import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { professionalAPI, patientAPI } from '../utils/api';

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  folio: string;
}

interface GlucoseDataPoint {
  fecha: string;
  glucosa: number;
  objetivo: number;
}

export function TablasEvolucion() {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [glucoseData, setGlucoseData] = useState<GlucoseDataPoint[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [average, setAverage] = useState<number>(0);

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Load glucose data when patient changes
  useEffect(() => {
    if (selectedPatientId) {
      loadGlucoseData(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true);
      const result = await professionalAPI.getPatients();
      
      if (result.success && result.patients.length > 0) {
        setPatients(result.patients);
        // Auto-select first patient
        setSelectedPatientId(result.patients[0].id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadGlucoseData = async (patientId: string) => {
    try {
      setIsLoadingData(true);
      const result = await patientAPI.getGlucoseRecords(patientId);
      
      if (result.success && result.records.length > 0) {
        // Take last 14 records and format them
        const recentRecords = result.records.slice(0, 14).reverse();
        
        const chartData = recentRecords.map((record: any, index: number) => {
          // Parse date in local timezone (no UTC conversion)
          const [year, month, day] = record.date.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const label = `${date.getDate()} ${monthNames[date.getMonth()]}`;
          
          return {
            id: `glucose-${patientId}-${index}-${record.date}`, // Unique key
            fecha: label,
            glucosa: record.glucoseValue,
            objetivo: 140, // Target value
          };
        });
        
        setGlucoseData(chartData);
        
        // Calculate average
        const sum = recentRecords.reduce((acc: number, record: any) => acc + record.glucoseValue, 0);
        const avg = Math.round(sum / recentRecords.length);
        setAverage(avg);
      } else {
        setGlucoseData([]);
        setAverage(0);
      }
    } catch (error) {
      console.error('Error loading glucose data:', error);
      setGlucoseData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

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
            
            <select 
              className="bg-[#e1e9f2] rounded-[10px] px-[20px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Todos los pacientes</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.nombre} {patient.apellidos}
                </option>
              ))}
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
                  Promedio: <span className="font-semibold text-[#39588a]">{average} mg/dL</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}